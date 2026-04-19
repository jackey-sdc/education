# 题目Pydantic模型
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.models.problem import SubjectEnum, DifficultyEnum

class ProblemBase(BaseModel):
    """题目基础模型"""
    content: str = Field(..., description="题目内容")
    subject: SubjectEnum = Field(..., description="学科")
    difficulty_level: int = Field(..., ge=1, le=5, description="难度等级1-5")

class ProblemCreate(ProblemBase):
    """创建题目模型"""
    pass

class ProblemUpdate(BaseModel):
    """更新题目模型"""
    content: Optional[str] = Field(None, description="题目内容")
    subject: Optional[SubjectEnum] = Field(None, description="学科")
    difficulty_level: Optional[int] = Field(None, ge=1, le=5, description="难度等级1-5")

class ProblemResponse(ProblemBase):
    """题目响应模型"""
    problem_id: int = Field(..., description="题目ID")
    difficulty: DifficultyEnum = Field(..., description="难度级别")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True

class ProblemAnalyze(BaseModel):
    """题目分析响应模型"""
    subject: str = Field(..., description="学科")
    knowledge_points: List[str] = Field(..., description="知识点")
    difficulty: str = Field(..., description="难度")
    known_conditions: List[str] = Field(..., description="已知条件")
    target: str = Field(..., description="求解目标")
