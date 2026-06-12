from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    zip_code = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    role = Column(String, default="user")
    # Saved after the eligibility intake wizard
    situation_tags = Column(String, nullable=True)   # comma-separated
    household_size = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Pantry(Base):
    __tablename__ = "pantries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    zip_code = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hours = Column(String, nullable=True)
    requires_eligibility = Column(Boolean, default=False)
    no_id_required = Column(Boolean, default=True)
    immigration_safe = Column(Boolean, default=True)
    languages = Column(String, default="en,es")
    notes = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)


class Resource(Base):
    """Non-pantry resource: community fridges, mutual aid, WIC, immigrant orgs,
    legal aid, senior, student, know-your-rights, hotlines."""
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    address = Column(String, nullable=True)
    zip_code = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    url = Column(String, nullable=True)
    languages = Column(String, default="en,es")
    tags = Column(String, default="")  # comma-separated situation tags
    no_id_required = Column(Boolean, default=True)
    immigration_safe = Column(Boolean, default=True)


class FoodListing(Base):
    __tablename__ = "food_listings"
    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    zip_code = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    pickup_window = Column(String, nullable=False)
    contact_phone = Column(String, nullable=True)
    claimed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)


class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, default="volunteer")
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    service_zips = Column(String, nullable=True)
    languages = Column(String, default="en")
    notes = Column(Text, nullable=True)


class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    donation_type = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, default="open")  # open | claimed
    claimed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True, index=True)
    donor_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    amount_usd = Column(Float, nullable=False)
    method = Column(String, default="card")
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class MealPlan(Base):
    __tablename__ = "meal_plans"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    weekly_budget_usd = Column(Float, nullable=False)
    servings = Column(Integer, default=1)
    diet = Column(String, default="any", index=True)
    # any | vegetarian | vegan | halal | gluten_free | diabetic
    summary = Column(Text, nullable=False)
    recipes_json = Column(Text, nullable=False)
