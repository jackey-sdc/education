# 动画模型
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.config.config import Base

class AnimationTypeEnum(str, enum.Enum):
    """动画类型枚举"""
    MATH = "math"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"

class Animation(Base):
    """动画模型"""
    __tablename__ = "animations"
    
    animation_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(AnimationTypeEnum), nullable=False)
    file_path = Column(String(255), nullable=False)
    parameters = Column(Text)  # JSON格式的动画参数
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    problems = relationship("Problem", secondary="problem_animations", back_populates="animations")
    
    def __repr__(self):
        return f"<Animation(animation_id={self.animation_id}, name='{self.name}', type='{self.type}')>"
