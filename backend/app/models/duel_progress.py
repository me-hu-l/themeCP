from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base
import enum

class ProblemStatus(str, enum.Enum):
    pending = "pending"
    solved = "solved"

class DuelProgress(Base):
    __tablename__ = "duel_progress"
    __table_args__ = (
        UniqueConstraint("duel_id", "user_id", "problem_slot", name="uq_duel_user_slot"),
    )

    id = Column(Integer, primary_key=True, index=True)
    duel_id = Column(Integer, ForeignKey("duels.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    problem_slot = Column(Integer, nullable=False)  # 1 to 4

    status = Column(Enum(ProblemStatus), default=ProblemStatus.pending)
    first_solved_at = Column(DateTime(timezone=True), nullable=True)
    submission_id = Column(Integer, nullable=True)  # ID of the submission that solved the problem

    user = relationship("User", back_populates="duel_progress")
    duel = relationship("Duel", back_populates="duel_progress")
    def __repr__(self):
        return f"<DuelProgress duel_id={self.duel_id} user_id={self.user_id} slot={self.problem_slot} status={self.status}>"
    
