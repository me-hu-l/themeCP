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

    created_duels = relationship("Duel", foreign_keys="[Duel.creator_id]", back_populates="creator", cascade="all, delete")
    opponent_duels = relationship("Duel", foreign_keys="[Duel.opponent_id]", back_populates="opponent", cascade="all, delete")

    duel_progress = relationship("DuelProgress",foreign_keys="[DuelProgress.user_id]" , back_populates="user", cascade="all, delete")
