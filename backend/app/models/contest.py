from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class Contest(Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    topic = Column(String, nullable=False)  # 'mixed', 'dp', 'greedy', etc.
    level = Column(Integer, nullable=False)

    start_time = Column(DateTime, nullable=True)  # when contest starts
    end_time = Column(DateTime, nullable=True)    # when contest ends
    phase = Column(String, default="not_started")  # 'not_started', 'ongoing', 'finished'

    # Problem info
    problem1_link = Column(String)
    problem1_rating = Column(Integer)
    problem1_solved_at = Column(DateTime, nullable=True)

    problem2_link = Column(String)
    problem2_rating = Column(Integer)
    problem2_solved_at = Column(DateTime, nullable=True)

    problem3_link = Column(String)
    problem3_rating = Column(Integer)
    problem3_solved_at = Column(DateTime, nullable=True)

    problem4_link = Column(String)
    problem4_rating = Column(Integer)
    problem4_solved_at = Column(DateTime, nullable=True)

    performance = Column(Float)  # maybe 'success' or 'fail'
    local_rating = Column(Float)  # rating after this contest
    delta = Column(Float)         # rating change
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="contests")
