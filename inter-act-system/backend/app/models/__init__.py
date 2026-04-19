# 数据库模型初始化文件
from app.models.user import User
from app.models.problem import Problem
from app.models.knowledge_point import KnowledgePoint
from app.models.problem_knowledge_point import ProblemKnowledgePoint
from app.models.solution import Solution
from app.models.animation import Animation
from app.models.problem_animation import ProblemAnimation
from app.models.case import Case
from app.models.knowledge_point_case import KnowledgePointCase
from app.models.learning_record import LearningRecord
from app.models.problem_attempt import ProblemAttempt
from app.models.progress import Progress
from app.models.preference import Preference

__all__ = [
    "User",
    "Problem",
    "KnowledgePoint",
    "ProblemKnowledgePoint",
    "Solution",
    "Animation",
    "ProblemAnimation",
    "Case",
    "KnowledgePointCase",
    "LearningRecord",
    "ProblemAttempt",
    "Progress",
    "Preference"
]
