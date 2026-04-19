# 题目API路由
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import get_db
from app.schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse, ProblemAnalyze
from app.models.problem import Problem
from app.services.problem_analyzer import ProblemAnalyzer

router = APIRouter()

@router.get("/", response_model=list[ProblemResponse])
async def get_problems(
    subject: str = None,
    difficulty: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取题目列表"""
    query = db.query(Problem)
    
    if subject:
        query = query.filter(Problem.subject == subject)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    
    problems = query.offset(skip).limit(limit).all()
    return problems

@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: int,
    db: Session = Depends(get_db)
):
    """获取题目详情"""
    problem = db.query(Problem).filter(Problem.problem_id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")
    return problem

@router.post("/", response_model=ProblemResponse, status_code=201)
async def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db)
):
    """创建题目"""
    # 分析题目
    analyzer = ProblemAnalyzer()
    analysis = analyzer.analyze(problem.content)
    
    # 创建题目
    db_problem = Problem(
        content=problem.content,
        subject=problem.subject,
        difficulty_level=problem.difficulty_level,
        difficulty=analysis["difficulty"]
    )
    
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    
    return db_problem

@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: int,
    problem: ProblemUpdate,
    db: Session = Depends(get_db)
):
    """更新题目"""
    db_problem = db.query(Problem).filter(Problem.problem_id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    # 分析题目
    if problem.content:
        analyzer = ProblemAnalyzer()
        analysis = analyzer.analyze(problem.content)
        db_problem.content = problem.content
        db_problem.difficulty = analysis["difficulty"]
    
    if problem.subject:
        db_problem.subject = problem.subject
    if problem.difficulty_level:
        db_problem.difficulty_level = problem.difficulty_level
    
    db.commit()
    db.refresh(db_problem)
    
    return db_problem

@router.delete("/{problem_id}", status_code=204)
async def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db)
):
    """删除题目"""
    db_problem = db.query(Problem).filter(Problem.problem_id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    db.delete(db_problem)
    db.commit()
    
    return None

@router.post("/analyze", response_model=ProblemAnalyze)
async def analyze_problem(
    content: dict,
    db: Session = Depends(get_db)
):
    """分析题目"""
    if "content" not in content:
        raise HTTPException(status_code=400, detail="缺少题目内容")
    
    analyzer = ProblemAnalyzer()
    analysis = analyzer.analyze(content["content"])
    
    return analysis
