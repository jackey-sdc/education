# 知识点模型
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class KnowledgePoint(Base):
    """知识点模型"""
    __tablename__ = "knowledge_points"
    
    knowledge_point_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    subject = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    problems = relationship("Problem", secondary="problem_knowledge_points", back_populates="knowledge_points")
    cases = relationship("Case", secondary="knowledge_point_cases", back_populates="knowledge_points")
    
    def __repr__(self):
        return f"<KnowledgePoint(knowledge_point_id={self.knowledge_point_id}, name='{self.name}')>"
