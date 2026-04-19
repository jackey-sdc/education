# 问题和知识点关联模型
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.config.config import Base

class ProblemKnowledgePoint(Base):
    """问题和知识点关联模型"""
    __tablename__ = "problem_knowledge_points"
    
    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.problem_id"), nullable=False)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.knowledge_point_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
