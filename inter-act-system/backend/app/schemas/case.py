# 案例Pydantic模型
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.case import CaseTypeEnum

class CaseBase(BaseModel):
    """案例基础模型"""
    title: str = Field(..., description="案例标题")
    description: str = Field(..., description="案例描述")
    type: CaseTypeEnum = Field(..., description="案例类型")
    subject: str = Field(..., description="学科")

class CaseCreate(CaseBase):
    """创建案例模型"""
    pass

class CaseUpdate(BaseModel):
    """更新案例模型"""
    title: Optional[str] = Field(None, description="案例标题")
    description: Optional[str] = Field(None, description="案例描述")
    type: Optional[CaseTypeEnum] = Field(None, description="案例类型")
    subject: Optional[str] = Field(None, description="学科")

class CaseResponse(CaseBase):
    """案例响应模型"""
    case_id: int = Field(..., description="案例ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True
