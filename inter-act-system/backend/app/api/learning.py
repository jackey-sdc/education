# 学习API路由
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import get_db
from app.schemas.learning import LearningRecordCreate, LearningRecordUpdate, LearningRecordResponse, ProgressCreate, ProgressUpdate, ProgressResponse, ProblemAttemptCreate, ProblemAttemptResponse
from app.models.learning_record import LearningRecord
from app.models.progress import Progress
from app.models.problem_attempt import ProblemAttempt

router = APIRouter()

# 学习记录
@router.get("/records", response_model=list[LearningRecordResponse])
async def get_learning_records(
    user_id: int = None,
    problem_id: int = None,
    is_completed: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取学习记录列表"""
    query = db.query(LearningRecord)
    
    if user_id:
        query = query.filter(LearningRecord.user_id == user_id)
    if problem_id:
        query = query.filter(LearningRecord.problem_id == problem_id)
    if is_completed is not None:
        query = query.filter(LearningRecord.is_completed == is_completed)
    
    records = query.offset(skip).limit(limit).all()
    return records

@router.post("/records", response_model=LearningRecordResponse, status_code=201)
async def create_learning_record(
    record: LearningRecordCreate,
    db: Session = Depends(get_db)
):
    """创建学习记录"""
    db_record = LearningRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/records/{record_id}", response_model=LearningRecordResponse)
async def update_learning_record(
    record_id: int,
    record: LearningRecordUpdate,
    db: Session = Depends(get_db)
):
    """更新学习记录"""
    db_record = db.query(LearningRecord).filter(LearningRecord.record_id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="学习记录不存在")
    
    for key, value in record.dict(exclude_unset=True).items():
        setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    
    return db_record

# 学习进度
@router.get("/progress", response_model=list[ProgressResponse])
async def get_progress(
    user_id: int = None,
    knowledge_point_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取学习进度列表"""
    query = db.query(Progress)
    
    if user_id:
        query = query.filter(Progress.user_id == user_id)
    if knowledge_point_id:
        query = query.filter(Progress.knowledge_point_id == knowledge_point_id)
    
    progress_list = query.offset(skip).limit(limit).all()
    return progress_list

@router.post("/progress", response_model=ProgressResponse, status_code=201)
async def create_progress(
    progress: ProgressCreate,
    db: Session = Depends(get_db)
):
    """创建学习进度"""
    # 检查是否已存在
    existing = db.query(Progress).filter(
        Progress.user_id == progress.user_id,
        Progress.knowledge_point_id == progress.knowledge_point_id
    ).first()
    
    if existing:
        # 更新现有进度
        existing.mastery_level = progress.mastery_level
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # 创建新进度
        db_progress = Progress(**progress.dict())
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress

@router.put("/progress/{progress_id}", response_model=ProgressResponse)
async def update_progress(
    progress_id: int,
    progress: ProgressUpdate,
    db: Session = Depends(get_db)
):
    """更新学习进度"""
    db_progress = db.query(Progress).filter(Progress.progress_id == progress_id).first()
    if not db_progress:
        raise HTTPException(status_code=404, detail="学习进度不存在")
    
    if progress.mastery_level:
        db_progress.mastery_level = progress.mastery_level
    
    db.commit()
    db.refresh(db_progress)
    
    return db_progress

# 问题尝试
@router.get("/attempts", response_model=list[ProblemAttemptResponse])
async def get_problem_attempts(
    user_id: int = None,
    problem_id: int = None,
    is_correct: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取问题尝试列表"""
    query = db.query(ProblemAttempt)
    
    if user_id:
        query = query.filter(ProblemAttempt.user_id == user_id)
    if problem_id:
        query = query.filter(ProblemAttempt.problem_id == problem_id)
    if is_correct is not None:
        query = query.filter(ProblemAttempt.is_correct == is_correct)
    
    attempts = query.offset(skip).limit(limit).all()
    return attempts

@router.post("/attempts", response_model=ProblemAttemptResponse, status_code=201)
async def create_problem_attempt(
    attempt: ProblemAttemptCreate,
    db: Session = Depends(get_db)
):
    """创建问题尝试"""
    db_attempt = ProblemAttempt(**attempt.dict())
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt
