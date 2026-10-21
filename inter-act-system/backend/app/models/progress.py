# 进度模型
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.config import Base

class Progress(Base):
    """进度模型"""
    __tablename__ = "progress"
    
    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.knowledge_point_id"), nullable=False)
    mastery_level = Column(Float, nullable=False)  # 0-100
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User")
    knowledge_point = relationship("KnowledgePoint")
    
    def __repr__(self):
        return f"<Progress(progress_id={self.progress_id}, user_id={self.user_id}, knowledge_point_id={self.knowledge_point_id}, mastery_level={self.mastery_level})>"
