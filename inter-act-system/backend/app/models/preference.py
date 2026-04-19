# 用户偏好模型
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class Preference(Base):
    """用户偏好模型"""
    __tablename__ = "preferences"
    
    preference_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    key = Column(String(50), nullable=False)
    value = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    user = relationship("User")
    
    def __repr__(self):
        return f"<Preference(preference_id={self.preference_id}, user_id={self.user_id}, key='{self.key}', value='{self.value}')>"
