# 问题和动画关联模型
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.config.config import Base

class ProblemAnimation(Base):
    """问题和动画关联模型"""
    __tablename__ = "problem_animations"
    
    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.problem_id"), nullable=False)
    animation_id = Column(Integer, ForeignKey("animations.animation_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
