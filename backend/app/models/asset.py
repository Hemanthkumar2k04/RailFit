from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)  # RF-2024-001234
    type = Column(String(100), nullable=False)
    vendor = Column(String(255), nullable=False)
    location = Column(String(500), nullable=False)
    install_date = Column(DateTime(timezone=True), nullable=False)
    warranty_period = Column(Integer, nullable=False)  # months
    health_score = Column(Integer, default=100)
    predicted_rul = Column(Integer)  # Remaining Useful Life in months
    status = Column(String(50), default="active")
    qr_code = Column(Text)  # Base64 encoded QR code
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # inspections = relationship("Inspection", back_populates="asset")
    # alerts = relationship("Alert", back_populates="asset")