from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class Contest(Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    topic = Column(String, nullable=False)  # 'mixed', 'dp', 'greedy', etc.
    contest_level = Column(Integer, nullable=False)
    contest_no = Column(Integer, nullable=True)  # Contest number for sorting

    R1= Column(Integer, nullable=True)  # Rating for problem 1
    R2= Column(Integer, nullable=True)  # Rating for problem 2  
    R3= Column(Integer, nullable=True)  # Rating for problem 3
    R4= Column(Integer, nullable=True)  # Rating for problem 4
    
    T1 = Column(Float, nullable=True)  # Time taken for problem 1
    T2 = Column(Float, nullable=True)  # Time taken for problem 2
    T3 = Column(Float, nullable=True)  # Time taken for problem 3
    T4 = Column(Float, nullable=True)  # Time taken for problem 4

    date = Column(String, nullable=True)  # Readable date
    performance = Column(Float, nullable=True)  # maybe 'success' or 'fail'
    rating = Column(Float, nullable=True)  # rating after this contest
    delta = Column(Float, nullable=True)  # rating change
    
    contestId1 = Column(Integer, nullable=True)  # Contest ID for problem 1
    contestId2 = Column(Integer, nullable=True)  # Contest ID for problem 2
    contestId3 = Column(Integer, nullable=True)  # Contest ID for problem 3
    contestId4 = Column(Integer, nullable=True)  # Contest ID for problem 4

    index1 = Column(String, nullable=True)  # Index for problem 1
    index2 = Column(String, nullable=True)  # Index for problem 2
    index3 = Column(String, nullable=True)  # Index for problem 3
    index4 = Column(String, nullable=True)  # Index for problem 4

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    
    user = relationship("User", back_populates="contests")

