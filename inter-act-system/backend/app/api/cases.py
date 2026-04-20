# 案例API路由
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import get_db
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.models.case import Case

router = APIRouter()

@router.get("/", response_model=list[CaseResponse])
async def get_cases(
    type: str = None,
    subject: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取案例列表"""
    query = db.query(Case)
    
    if type:
        query = query.filter(Case.type == type)
    if subject:
        query = query.filter(Case.subject == subject)
    
    cases = query.offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    """获取案例详情"""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="案例不存在")
    return case

@router.post("/", response_model=CaseResponse, status_code=201)
async def create_case(
    case: CaseCreate,
    db: Session = Depends(get_db)
):
    """创建案例"""
    db_case = Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case: CaseUpdate,
    db: Session = Depends(get_db)
):
    """更新案例"""
    db_case = db.query(Case).filter(Case.case_id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案例不存在")
    
    for key, value in case.model_dump(exclude_unset=True).items():
        setattr(db_case, key, value)
    
    db.commit()
    db.refresh(db_case)
    
    return db_case

@router.delete("/{case_id}", status_code=204)
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    """删除案例"""
    db_case = db.query(Case).filter(Case.case_id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案例不存在")
    
    db.delete(db_case)
    db.commit()
    
    return None
