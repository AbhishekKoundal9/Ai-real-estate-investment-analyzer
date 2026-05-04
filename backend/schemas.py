from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    location: str = Field(..., description="Property Location")
    area: float = Field(..., description="Area in sq ft", gt=0)
    bhk: int = Field(..., description="Number of bedrooms (BHK)", gt=0)
    initial_price: float = Field(..., description="Initial price in Lakhs", gt=0)
    monthly_rent: float = Field(..., description="Monthly rent in Rs", gt=0)

class AnalyzeResponse(BaseModel):
    predicted_price: float
    roi: float
    rental_yield: float
    risk_level: str
    investment_score: float
    # New chart data fields
    probability_breakdown: List[float]
    feature_importances: List[float]
    trend_data: List[float]

class RecommendationRequest(BaseModel):
    location: str = Field(..., description="Preferred Location")
    max_budget: float = Field(..., description="Maximum budget in Lakhs", gt=0)
    bhk: int = Field(..., description="Desired Bedrooms (BHK)", gt=0)

class PropertyCard(BaseModel):
    id: str
    location: str
    area: float
    bhk: int
    predicted_price: float
    value_score: Optional[float] = None

class RecommendationResponse(BaseModel):
    recommendations: List[PropertyCard]
