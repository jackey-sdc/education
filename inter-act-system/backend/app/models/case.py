# 案例模型
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.config.config import Base

class CaseTypeEnum(str, enum.Enum):
    """案例类型枚举"""
    INDUSTRY = "industry"
    DAILY_LIFE = "daily_life"
    SCIENCE = "science"

class Case(Base):
    """案例模型"""
    __tablename__ = "cases"
    
    case_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(SQLEnum(CaseTypeEnum), nullable=False)
    subject = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    knowledge_points = relationship("KnowledgePoint", secondary="knowledge_point_cases", back_populates="cases")
    
    def __repr__(self):
        return f"<Case(case_id={self.case_id}, title='{self.title}', type='{self.type}')>"
