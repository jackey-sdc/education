# 学习相关Pydantic模型
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# 学习记录
class LearningRecordBase(BaseModel):
    """学习记录基础模型"""
    user_id: int = Field(..., description="用户ID")
    problem_id: int = Field(..., description="题目ID")

class LearningRecordCreate(LearningRecordBase):
    """创建学习记录模型"""
    pass

class LearningRecordUpdate(BaseModel):
    """更新学习记录模型"""
    is_completed: Optional[bool] = Field(None, description="是否完成")
    completed_at: Optional[datetime] = Field(None, description="完成时间")
    time_spent: Optional[int] = Field(None, description="用时（秒）")

class LearningRecordResponse(LearningRecordBase):
    """学习记录响应模型"""
    record_id: int = Field(..., description="记录ID")
    started_at: datetime = Field(..., description="开始时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")
    is_completed: bool = Field(..., description="是否完成")
    time_spent: Optional[int] = Field(None, description="用时（秒）")
    
    class Config:
        from_attributes = True

# 学习进度
class ProgressBase(BaseModel):
    """学习进度基础模型"""
    user_id: int = Field(..., description="用户ID")
    knowledge_point_id: int = Field(..., description="知识点ID")
    mastery_level: float = Field(..., ge=0, le=100, description="掌握程度0-100")

class ProgressCreate(ProgressBase):
    """创建学习进度模型"""
    pass

class ProgressUpdate(BaseModel):
    """更新学习进度模型"""
    mastery_level: float = Field(..., ge=0, le=100, description="掌握程度0-100")

class ProgressResponse(ProgressBase):
    """学习进度响应模型"""
    progress_id: int = Field(..., description="进度ID")
    last_updated: datetime = Field(..., description="最后更新时间")
    
    class Config:
        from_attributes = True

# 问题尝试
class ProblemAttemptBase(BaseModel):
    """问题尝试基础模型"""
    user_id: int = Field(..., description="用户ID")
    problem_id: int = Field(..., description="题目ID")
    solution: Optional[str] = Field(None, description="尝试的解决方案")
    is_correct: Optional[bool] = Field(None, description="是否正确")

class ProblemAttemptCreate(ProblemAttemptBase):
    """创建问题尝试模型"""
    pass

class ProblemAttemptResponse(ProblemAttemptBase):
    """问题尝试响应模型"""
    attempt_id: int = Field(..., description="尝试ID")
    created_at: datetime = Field(..., description="创建时间")
    
    class Config:
        from_attributes = True
