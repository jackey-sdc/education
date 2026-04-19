# 解决方案Pydantic模型
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SolutionBase(BaseModel):
    """解决方案基础模型"""
    problem_id: int = Field(..., description="题目ID")
    content: str = Field(..., description="解决方案内容")
    steps: str = Field(..., description="解题步骤")
    difficulty: int = Field(..., ge=1, le=5, description="难度等级1-5")

class SolutionCreate(SolutionBase):
    """创建解决方案模型"""
    pass

class SolutionUpdate(BaseModel):
    """更新解决方案模型"""
    content: Optional[str] = Field(None, description="解决方案内容")
    steps: Optional[str] = Field(None, description="解题步骤")
    difficulty: Optional[int] = Field(None, ge=1, le=5, description="难度等级1-5")

class SolutionResponse(SolutionBase):
    """解决方案响应模型"""
    solution_id: int = Field(..., description="解决方案ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True
