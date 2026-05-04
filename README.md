# AI Real Estate Investment Analyzer

An AI-powered web application that helps users analyze real estate investments using machine learning. The system predicts property prices and evaluates investment performance through ROI, rental yield, risk level, and an overall investment score.

---

## Features

* Property price prediction using machine learning
* Return on Investment (ROI) calculation
* Rental yield analysis
* Risk level classification (Low / Medium / High)
* Investment score (0–100)
* Data visualization (trends and comparisons)
* Property recommendation system

---

## Technologies Used

* Python
* FastAPI (Backend API)
* Scikit-learn (Machine Learning)
* Uvicorn (Server)
* HTML, CSS, JavaScript (Frontend)
* Pandas and NumPy (Data Processing)

---

## How It Works

1. User enters:

   * Location
   * Area (sq ft)
   * BHK
   * Initial Price
   * Monthly Rent

2. System processes:

   * Predicts property price using ML model
   * Calculates ROI
   * Calculates rental yield
   * Determines risk level
   * Generates investment score

3. Displays:

   * Price prediction
   * ROI and rental yield
   * Risk classification
   * Graphical insights

---

## API Endpoints

### Analyze Property

POST `/api/analyze`
Returns prediction, ROI, rental yield, risk, and score

### Get Locations

GET `/api/locations`
Returns available locations

### Recommend Properties

POST `/api/recommend`
Returns recommended properties

---

## Core Calculations

ROI:

```id="1g9qah"
ROI = ((Predicted Price - Initial Price) / Initial Price) × 100
```

Rental Yield:

```id="r7g4q2"
Rental Yield = (Monthly Rent × 12 / Property Price) × 100
```

Risk Logic:

* High ROI + High Yield → Low Risk
* Medium Values → Medium Risk
* Low Values → High Risk

---

## Installation and Setup

### 1. Clone Repository

```id="zpq2dz"
git clone https://github.com/AbhishekKoundal9/Ai-real-estate-investment-analyzer.git
cd Ai-real-estate-investment-analyzer
```

---

### 2. Setup Backend

```id="y61o35"
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 3. Run Frontend

```id="vq0plf"
cd frontend
python -m http.server 3000
```

Open in browser:

```id="5nn2ks"
http://localhost:3000
```

---

## Future Improvements

* Integration with real-time property APIs
* Deep learning-based prediction models
* Mobile application support
* Map-based property visualization

---

## Author

Abhishek Koundal

---

## Project Repository

https://github.com/AbhishekKoundal9/Ai-real-estate-investment-analyzer

---

## Note

This project is developed for academic purposes and demonstrates the use of machine learning in real estate investment analysis.

