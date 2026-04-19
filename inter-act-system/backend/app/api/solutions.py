# 解决方案API路由
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import get_db
from app.schemas.solution import SolutionCreate, SolutionUpdate, SolutionResponse
from app.models.solution import Solution

router = APIRouter()

@router.get("/", response_model=list[SolutionResponse])
async def get_solutions(
    problem_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取解决方案列表"""
    query = db.query(Solution)
    
    if problem_id:
        query = query.filter(Solution.problem_id == problem_id)
    
    solutions = query.offset(skip).limit(limit).all()
    return solutions

@router.get("/{solution_id}", response_model=SolutionResponse)
async def get_solution(
    solution_id: int,
    db: Session = Depends(get_db)
):
    """获取解决方案详情"""
    solution = db.query(Solution).filter(Solution.solution_id == solution_id).first()
    if not solution:
        raise HTTPException(status_code=404, detail="解决方案不存在")
    return solution

@router.post("/", response_model=SolutionResponse, status_code=201)
async def create_solution(
    solution: SolutionCreate,
    db: Session = Depends(get_db)
):
    """创建解决方案"""
    db_solution = Solution(**solution.dict())
    db.add(db_solution)
    db.commit()
    db.refresh(db_solution)
    return db_solution

@router.put("/{solution_id}", response_model=SolutionResponse)
async def update_solution(
    solution_id: int,
    solution: SolutionUpdate,
    db: Session = Depends(get_db)
):
    """更新解决方案"""
    db_solution = db.query(Solution).filter(Solution.solution_id == solution_id).first()
    if not db_solution:
        raise HTTPException(status_code=404, detail="解决方案不存在")
    
    for key, value in solution.dict(exclude_unset=True).items():
        setattr(db_solution, key, value)
    
    db.commit()
    db.refresh(db_solution)
    
    return db_solution

@router.delete("/{solution_id}", status_code=204)
async def delete_solution(
    solution_id: int,
    db: Session = Depends(get_db)
):
    """删除解决方案"""
    db_solution = db.query(Solution).filter(Solution.solution_id == solution_id).first()
    if not db_solution:
        raise HTTPException(status_code=404, detail="解决方案不存在")
    
    db.delete(db_solution)
    db.commit()
    
    return None
