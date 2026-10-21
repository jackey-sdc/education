# 问题尝试模型
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class ProblemAttempt(Base):
    """问题尝试模型"""
    __tablename__ = "problem_attempts"
    
    attempt_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.problem_id"), nullable=False)
    solution = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    user = relationship("User")
    problem = relationship("Problem")
    
    def __repr__(self):
        return f"<ProblemAttempt(attempt_id={self.attempt_id}, user_id={self.user_id}, problem_id={self.problem_id})>"
