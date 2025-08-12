from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..config.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=False, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    auth_provider = Column(String, nullable=False, default="google")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    codeforces_handle = Column(String, unique=True, index=True)

    contests = relationship("Contest", back_populates="user", cascade="all, delete")
