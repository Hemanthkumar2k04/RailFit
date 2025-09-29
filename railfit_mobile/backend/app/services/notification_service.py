from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    condition_rating = Column(String(50), nullable=False)
    notes = Column(Text)
    photo_url = Column(String(500))
    gps_latitude = Column(Float)
    gps_longitude = Column(Float)
    inspection_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # asset = relationship("Asset", back_populates="inspections")
    # inspector = relationship("User")