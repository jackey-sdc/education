# 学习记录模型
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class LearningRecord(Base):
    """学习记录模型"""
    __tablename__ = "learning_records"
    
    record_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.problem_id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False)
    time_spent = Column(Integer, nullable=True)  # 单位：秒
    
    # 关系
    user = relationship("User")
    problem = relationship("Problem")
    
    def __repr__(self):
        return f"<LearningRecord(record_id={self.record_id}, user_id={self.user_id}, problem_id={self.problem_id})>"
