# 解决方案模型
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class Solution(Base):
    """解决方案模型"""
    __tablename__ = "solutions"
    
    solution_id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.problem_id"), nullable=False)
    content = Column(Text, nullable=False)
    steps = Column(Text)  # JSON格式的解题步骤
    difficulty = Column(Integer, nullable=False)  # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    problem = relationship("Problem", back_populates="solutions")
    
    def __repr__(self):
        return f"<Solution(solution_id={self.solution_id}, problem_id={self.problem_id})>"
