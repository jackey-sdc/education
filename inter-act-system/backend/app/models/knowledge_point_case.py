# 知识点和案例关联模型
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.config.config import Base

class KnowledgePointCase(Base):
    """知识点和案例关联模型"""
    __tablename__ = "knowledge_point_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.knowledge_point_id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.case_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
