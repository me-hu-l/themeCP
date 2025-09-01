from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Enum
from sqlalchemy.sql import func
from ..config.database import Base
from sqlalchemy.orm import relationship
import enum

class FriendshipStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    status = Column(Enum(FriendshipStatus), default=FriendshipStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    requester = relationship("User", foreign_keys=[requester_id], backref="sent_friend_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="received_friend_requests")
