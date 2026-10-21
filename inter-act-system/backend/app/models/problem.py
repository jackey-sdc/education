# 问题模型
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.config.config import Base

class SubjectEnum(str, enum.Enum):
    """学科枚举"""
    MATH = "math"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"

class DifficultyEnum(str, enum.Enum):
    """难度枚举"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Problem(Base):
    """问题模型"""
    __tablename__ = "problems"
    
    problem_id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    subject = Column(SQLEnum(SubjectEnum), nullable=False)
    difficulty_level = Column(Integer, nullable=False)  # 1-5
    difficulty = Column(SQLEnum(DifficultyEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    solutions = relationship("Solution", back_populates="problem")
    knowledge_points = relationship("KnowledgePoint", secondary="problem_knowledge_points", back_populates="problems")
    animations = relationship("Animation", secondary="problem_animations", back_populates="problems")
    attempts = relationship("ProblemAttempt", back_populates="problem")
    
    def __repr__(self):
        return f"<Problem(problem_id={self.problem_id}, subject='{self.subject}', difficulty='{self.difficulty}')>"
