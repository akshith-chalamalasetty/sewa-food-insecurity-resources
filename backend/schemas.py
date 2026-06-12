from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    zip_code: Optional[str] = None
    preferred_language: str = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    credential: str  # Google ID token from the Sign-In button


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    zip_code: Optional[str]
    preferred_language: str
    role: str
    situation_tags: Optional[str] = None
    household_size: Optional[int] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class IntakeSave(BaseModel):
    situation_tags: List[str]
    household_size: Optional[int] = None
    zip_code: Optional[str] = None


# ---------- Pantries ----------
class PantryOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    zip_code: str
    phone: Optional[str]
    hours: Optional[str]
    requires_eligibility: bool
    no_id_required: bool
    immigration_safe: bool
    languages: str
    notes: Optional[str]
    lat: Optional[float]
    lng: Optional[float]

    class Config:
        from_attributes = True


# ---------- Resources ----------
class ResourceOut(BaseModel):
    id: int
    name: str
    category: str
    description: str
    address: Optional[str]
    zip_code: Optional[str]
    phone: Optional[str]
    url: Optional[str]
    languages: str
    tags: str
    no_id_required: bool
    immigration_safe: bool

    class Config:
        from_attributes = True


# ---------- Food recovery ----------
class FoodListingCreate(BaseModel):
    business_name: str
    address: str
    zip_code: str
    description: str
    pickup_window: str
    contact_phone: Optional[str] = None


class FoodListingOut(FoodListingCreate):
    id: int
    status: str
    claimed_by_user_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Volunteers ----------
class VolunteerCreate(BaseModel):
    phone: Optional[str] = None
    service_zips: Optional[str] = None
    languages: str = "en"
    notes: Optional[str] = None


class VolunteerOut(BaseModel):
    id: int
    name: str
    role: str
    phone: Optional[str]
    email: Optional[str]
    service_zips: Optional[str]
    languages: str
    notes: Optional[str]

    class Config:
        from_attributes = True


# ---------- Donors ----------
class DonorCreate(BaseModel):
    name: Optional[str] = None  # ignored — taken from the logged-in account
    donation_type: str          # food | cash | both | other
    contact: Optional[str] = None  # defaults to account email
    notes: Optional[str] = None


class DonorOut(DonorCreate):
    id: int
    status: str = "open"
    claimed_by_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Donations ----------
class DonationCreate(BaseModel):
    donor_name: str
    email: Optional[EmailStr] = None
    amount_usd: float
    method: str = "card"


class DonationOut(BaseModel):
    id: int
    amount_usd: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Meal plans ----------
class MealPlanOut(BaseModel):
    id: int
    title: str
    weekly_budget_usd: float
    servings: int
    diet: str
    summary: str
    recipes_json: str

    class Config:
        from_attributes = True


# ---------- Chatbot ----------
class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    history: List[dict] = []


class ChatReply(BaseModel):
    reply: str
    suggestions: List[str] = []
    source: str = "rule-based"
