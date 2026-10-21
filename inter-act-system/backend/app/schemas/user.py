# 用户Pydantic模型
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱")

class UserCreate(UserBase):
    """创建用户模型"""
    password: str = Field(..., min_length=6, description="密码")

class UserUpdate(BaseModel):
    """更新用户模型"""
    email: Optional[EmailStr] = Field(None, description="邮箱")
    password: Optional[str] = Field(None, min_length=6, description="密码")
    is_active: Optional[bool] = Field(None, description="是否活跃")
    is_admin: Optional[bool] = Field(None, description="是否管理员")

class UserResponse(UserBase):
    """用户响应模型"""
    user_id: int = Field(..., description="用户ID")
    is_active: bool = Field(..., description="是否活跃")
    is_admin: bool = Field(..., description="是否管理员")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """令牌模型"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(..., description="令牌类型")
