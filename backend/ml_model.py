import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

class RealEstateModel:
    def __init__(self):
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        
        self.dataset = None
        self.model_columns = []
        
        self._train_model()

    def _generate_synthetic_data(self):
        print("india_housing.csv not found. Generating synthetic Indian housing data...")
        np.random.seed(42)
        locations = ['Whitefield, Bangalore', 'Andheri West, Mumbai', 'Koramangala, Bangalore', 'Gachibowli, Hyderabad', 'Connaught Place, Delhi', 'New Town, Kolkata']
        data = []
        for _ in range(500):
            loc = np.random.choice(locations)
            bhk = np.random.randint(1, 5)
            # Base area around 500 sqft per bhk
            area = bhk * 500 + np.random.normal(0, 100)
            
            # Location multipliers
            loc_mult = 1.0
            if 'Mumbai' in loc: loc_mult = 2.5
            elif 'Delhi' in loc: loc_mult = 1.8
            elif 'Koramangala' in loc: loc_mult = 1.5
            elif 'Whitefield' in loc: loc_mult = 1.2
            elif 'Hyderabad' in loc: loc_mult = 1.1
            
            # Base price per sqft
            base_price = 5000 * loc_mult
            price_inr = area * base_price + np.random.normal(0, 500000)
            price_lakhs = max(price_inr / 100000, 15.0) # Min 15 Lakhs
            
            data.append({
                'Location': loc,
                'Area_sqft': area,
                'BHK': bhk,
                'Price_Lakhs': price_lakhs
            })
            
        return pd.DataFrame(data)

    def _train_model(self):
        data_path = "india_housing.csv"
        if os.path.exists(data_path):
            print(f"Loading dataset from {data_path}...")
            df = pd.read_csv(data_path)
            # Ensure required columns exist, or adapt them
            if not all(col in df.columns for col in ['Location', 'Area_sqft', 'BHK', 'Price_Lakhs']):
                print("Missing required columns in CSV. Falling back to synthetic data.")
                df = self._generate_synthetic_data()
        else:
            df = self._generate_synthetic_data()
            
        self.dataset = df
        
        # Prepare features and target
        X = df[['Location', 'Area_sqft', 'BHK']]
        y = df['Price_Lakhs']
        
        # One-hot encode Location
        X_encoded = pd.get_dummies(X, columns=['Location'])
        self.model_columns = list(X_encoded.columns)
        
        # Train models
        self.rf_model.fit(X_encoded, y)
        self.gb_model.fit(X_encoded, y)
        
        self.is_trained = True
        print("Models trained successfully on Indian Housing Dataset.")

    def predict(self, location: str, area: float, bhk: int) -> dict:
        if not self.is_trained:
            raise Exception("Model is not trained yet.")
        
        # Create input dataframe
        X_pred = pd.DataFrame({
            'Location': [location],
            'Area_sqft': [area],
            'BHK': [bhk]
        })
        
        X_pred_encoded = pd.get_dummies(X_pred, columns=['Location'])
        
        for col in self.model_columns:
            if col not in X_pred_encoded.columns:
                X_pred_encoded[col] = 0
                
        X_pred_encoded = X_pred_encoded[self.model_columns]
        
        rf_pred = self.rf_model.predict(X_pred_encoded)[0]
        gb_pred = self.gb_model.predict(X_pred_encoded)[0]
        
        avg_price_lakhs = (rf_pred + gb_pred) / 2
        
        # Generate chart data
        # Probability Breakdown: High, Medium-High, Average, Below Average, Low
        probability = [0.1, 0.2, 0.4, 0.2, 0.1]
        
        # Feature Importances: Location, Area, BHK, Condition (mock)
        importances = [0.45, 0.35, 0.15, 0.05]
        
        # Trend Data: 5 years projection based on price
        trend = [avg_price_lakhs * (1 + (i * 0.05)) for i in range(5)]
        
        return {
            "predicted_price": round(float(avg_price_lakhs), 2),
            "probability_breakdown": probability,
            "feature_importances": importances,
            "trend_data": [round(t, 2) for t in trend]
        }

    def get_locations(self) -> list:
        if self.dataset is None:
            return []
        return sorted([str(loc) for loc in self.dataset['Location'].dropna().unique()])

    def recommend_properties(self, location: str, max_budget_lakhs: float, bhk: int) -> list:
        if self.dataset is None:
            return []
            
        filtered = self.dataset[
            (self.dataset['Location'] == location) & 
            (self.dataset['BHK'] == bhk)
        ].copy()
        
        if filtered.empty:
            return []
            
        recommendations = []
        for index, row in filtered.iterrows():
            area = row['Area_sqft']
            
            if pd.isna(area):
                continue
                
            prediction = self.predict(location, area, bhk)
            pred_price_lakhs = prediction["predicted_price"]
            
            if pred_price_lakhs <= max_budget_lakhs:
                recommendations.append({
                    "id": str(index),
                    "location": location,
                    "area": round(float(area), 2),
                    "bhk": int(bhk),
                    "predicted_price": pred_price_lakhs
                })
                
        # Value Score (Area relative to Price is a simple metric)
        for rec in recommendations:
            rec['value_score'] = rec['area'] / rec['predicted_price'] if rec['predicted_price'] > 0 else 0
            
        # Normalize value score between 0 and 1
        if recommendations:
            max_vs = max(r['value_score'] for r in recommendations)
            for r in recommendations:
                r['value_score'] = r['value_score'] / max_vs if max_vs > 0 else 0
            
        recommendations.sort(key=lambda x: x['value_score'], reverse=True)
        return recommendations[:3]

# Singleton instance
model_instance = RealEstateModel()
