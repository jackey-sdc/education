# 动画Pydantic模型
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.animation import AnimationTypeEnum

class AnimationBase(BaseModel):
    """动画基础模型"""
    name: str = Field(..., description="动画名称")
    description: str = Field(..., description="动画描述")
    type: AnimationTypeEnum = Field(..., description="动画类型")
    file_path: str = Field(..., description="动画文件路径")
    parameters: str = Field(..., description="动画参数")

class AnimationCreate(AnimationBase):
    """创建动画模型"""
    pass

class AnimationUpdate(BaseModel):
    """更新动画模型"""
    name: Optional[str] = Field(None, description="动画名称")
    description: Optional[str] = Field(None, description="动画描述")
    type: Optional[AnimationTypeEnum] = Field(None, description="动画类型")
    file_path: Optional[str] = Field(None, description="动画文件路径")
    parameters: Optional[str] = Field(None, description="动画参数")

class AnimationResponse(AnimationBase):
    """动画响应模型"""
    animation_id: int = Field(..., description="动画ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True
