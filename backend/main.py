from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalyzeRequest, AnalyzeResponse, RecommendationRequest, RecommendationResponse
from typing import List
from ml_model import model_instance

app = FastAPI(title="Real Estate Investment Analyzer API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_property(request: AnalyzeRequest):
    # 1. Predict Price (in Lakhs) and get chart data
    prediction_data = model_instance.predict(
        request.location,
        request.area, 
        request.bhk
    )
    predicted_price = prediction_data["predicted_price"]
    
    # 2. ROI Calculation
    # ROI = ((predicted_price - initial_price) / initial_price) * 100
    roi = ((predicted_price - request.initial_price) / request.initial_price) * 100
    
    # 3. Rental Yield Calculation
    # Rental Yield = (monthly_rent * 12 / (predicted_price * 100000)) * 100
    rental_yield = (request.monthly_rent * 12 / (predicted_price * 100000)) * 100
    
    # 4. Risk Level Logicx
    if roi > 15 and rental_yield > 4:
        risk_level = "Low"
    elif roi > 10 or rental_yield > 3:
        risk_level = "Medium"
    else:
        risk_level = "High"
        
    # 5. Investment Score Calculation (0-100)
    roi_score = min(60, max(0, (roi / 30) * 60))
    yield_score = min(40, max(0, (rental_yield / 8) * 40))
    investment_score = roi_score + yield_score
    
    return AnalyzeResponse(
        predicted_price=round(predicted_price, 2),
        roi=round(roi, 2),
        rental_yield=round(rental_yield, 2),
        risk_level=risk_level,
        investment_score=round(investment_score, 1),
        probability_breakdown=prediction_data["probability_breakdown"],
        feature_importances=prediction_data["feature_importances"],
        trend_data=prediction_data["trend_data"]
    )

@app.get("/api/locations", response_model=List[str])
async def get_locations():
    return model_instance.get_locations()

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend_properties(request: RecommendationRequest):
    recs = model_instance.recommend_properties(
        request.location, 
        request.max_budget, 
        request.bhk
    )
    return RecommendationResponse(recommendations=recs)
