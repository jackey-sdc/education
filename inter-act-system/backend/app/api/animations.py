# 动画API路由
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import get_db
from app.schemas.animation import AnimationCreate, AnimationUpdate, AnimationResponse
from app.models.animation import Animation

router = APIRouter()

@router.get("/", response_model=list[AnimationResponse])
async def get_animations(
    type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取动画列表"""
    query = db.query(Animation)
    
    if type:
        query = query.filter(Animation.type == type)
    
    animations = query.offset(skip).limit(limit).all()
    return animations

@router.get("/{animation_id}", response_model=AnimationResponse)
async def get_animation(
    animation_id: int,
    db: Session = Depends(get_db)
):
    """获取动画详情"""
    animation = db.query(Animation).filter(Animation.animation_id == animation_id).first()
    if not animation:
        raise HTTPException(status_code=404, detail="动画不存在")
    return animation

@router.post("/", response_model=AnimationResponse, status_code=201)
async def create_animation(
    animation: AnimationCreate,
    db: Session = Depends(get_db)
):
    """创建动画"""
    db_animation = Animation(**animation.dict())
    db.add(db_animation)
    db.commit()
    db.refresh(db_animation)
    return db_animation

@router.put("/{animation_id}", response_model=AnimationResponse)
async def update_animation(
    animation_id: int,
    animation: AnimationUpdate,
    db: Session = Depends(get_db)
):
    """更新动画"""
    db_animation = db.query(Animation).filter(Animation.animation_id == animation_id).first()
    if not db_animation:
        raise HTTPException(status_code=404, detail="动画不存在")
    
    for key, value in animation.dict(exclude_unset=True).items():
        setattr(db_animation, key, value)
    
    db.commit()
    db.refresh(db_animation)
    
    return db_animation

@router.delete("/{animation_id}", status_code=204)
async def delete_animation(
    animation_id: int,
    db: Session = Depends(get_db)
):
    """删除动画"""
    db_animation = db.query(Animation).filter(Animation.animation_id == animation_id).first()
    if not db_animation:
        raise HTTPException(status_code=404, detail="动画不存在")
    
    db.delete(db_animation)
    db.commit()
    
    return None
