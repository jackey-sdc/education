# 数据库初始化脚本
import os
from app.config.config import engine, Base
from app.models import *

# 确保数据目录存在
data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

# 创建所有表
print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

# 初始化数据
from sqlalchemy.orm import sessionmaker
from app.config.config import SessionLocal

# 创建会话
db = SessionLocal()

# 初始化知识点
knowledge_points = [
    {"name": "二次函数", "description": "形如 f(x) = ax² + bx + c 的函数", "subject": "math"},
    {"name": "自由落体", "description": "物体在重力作用下的运动", "subject": "physics"},
    {"name": "化学反应", "description": "物质发生变化的过程", "subject": "chemistry"},
    {"name": "几何图形", "description": "点、线、面等构成的图形", "subject": "math"},
    {"name": "电磁现象", "description": "电场和磁场的相互作用", "subject": "physics"},
    {"name": "分子结构", "description": "分子的空间结构", "subject": "chemistry"},
]

for kp in knowledge_points:
    existing = db.query(KnowledgePoint).filter_by(name=kp["name"]).first()
    if not existing:
        new_kp = KnowledgePoint(**kp)
        db.add(new_kp)

db.commit()

# 初始化案例
cases = [
    {"title": "建筑中的二次函数应用", "description": "在建筑设计中，二次函数用于计算抛物线形屋顶的结构", "type": "industry", "subject": "math"},
    {"title": "蹦极中的自由落体", "description": "蹦极过程中，人在绳子绷紧前的运动是自由落体", "type": "daily_life", "subject": "physics"},
    {"title": "厨房中的化学反应", "description": "烹饪过程中发生的各种化学反应，如蛋白质变性", "type": "daily_life", "subject": "chemistry"},
    {"title": "桥梁设计中的几何应用", "description": "桥梁结构中的几何形状设计，如拱形桥", "type": "industry", "subject": "math"},
    {"title": "发电机中的电磁感应", "description": "发电机利用电磁感应原理将机械能转化为电能", "type": "industry", "subject": "physics"},
    {"title": "药物分子设计", "description": "药物研发中对分子结构的设计和优化", "type": "science", "subject": "chemistry"},
]

for case in cases:
    existing = db.query(Case).filter_by(title=case["title"]).first()
    if not existing:
        new_case = Case(**case)
        db.add(new_case)

db.commit()

# 关联知识点和案例
knowledge_point_case_relations = [
    {"knowledge_point_name": "二次函数", "case_title": "建筑中的二次函数应用"},
    {"knowledge_point_name": "自由落体", "case_title": "蹦极中的自由落体"},
    {"knowledge_point_name": "化学反应", "case_title": "厨房中的化学反应"},
    {"knowledge_point_name": "几何图形", "case_title": "桥梁设计中的几何应用"},
    {"knowledge_point_name": "电磁现象", "case_title": "发电机中的电磁感应"},
    {"knowledge_point_name": "分子结构", "case_title": "药物分子设计"},
]

for relation in knowledge_point_case_relations:
    kp = db.query(KnowledgePoint).filter_by(name=relation["knowledge_point_name"]).first()
    case = db.query(Case).filter_by(title=relation["case_title"]).first()
    if kp and case:
        existing = db.query(KnowledgePointCase).filter_by(
            knowledge_point_id=kp.knowledge_point_id,
            case_id=case.case_id
        ).first()
        if not existing:
            new_relation = KnowledgePointCase(
                knowledge_point_id=kp.knowledge_point_id,
                case_id=case.case_id
            )
            db.add(new_relation)

db.commit()

# 初始化动画
animations = [
    {"name": "二次函数图像", "description": "二次函数图像的动态绘制", "type": "math", "file_path": "animations/math/quadratic_function.js", "parameters": "{}"},
    {"name": "自由落体模拟", "description": "自由落体运动的模拟动画", "type": "physics", "file_path": "animations/physics/free_fall.js", "parameters": "{}"},
    {"name": "化学反应过程", "description": "化学反应过程的可视化", "type": "chemistry", "file_path": "animations/chemistry/chemical_reaction.js", "parameters": "{}"},
]

for animation in animations:
    existing = db.query(Animation).filter_by(name=animation["name"]).first()
    if not existing:
        new_animation = Animation(**animation)
        db.add(new_animation)

db.commit()

# 初始化题目
problems = [
    {
        "content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。",
        "subject": "math",
        "difficulty_level": 3,
        "difficulty": "medium"
    },
    {
        "content": "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）",
        "subject": "physics",
        "difficulty_level": 2,
        "difficulty": "easy"
    },
    {
        "content": "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？",
        "subject": "chemistry",
        "difficulty_level": 3,
        "difficulty": "medium"
    },
]

for problem in problems:
    existing = db.query(Problem).filter_by(content=problem["content"]).first()
    if not existing:
        new_problem = Problem(**problem)
        db.add(new_problem)

db.commit()

# 关联题目和知识点
problem_knowledge_point_relations = [
    {"problem_content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。", "knowledge_point_name": "二次函数"},
    {"problem_content": "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）", "knowledge_point_name": "自由落体"},
    {"problem_content": "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？", "knowledge_point_name": "化学反应"},
]

for relation in problem_knowledge_point_relations:
    problem = db.query(Problem).filter_by(content=relation["problem_content"]).first()
    kp = db.query(KnowledgePoint).filter_by(name=relation["knowledge_point_name"]).first()
    if problem and kp:
        existing = db.query(ProblemKnowledgePoint).filter_by(
            problem_id=problem.problem_id,
            knowledge_point_id=kp.knowledge_point_id
        ).first()
        if not existing:
            new_relation = ProblemKnowledgePoint(
                problem_id=problem.problem_id,
                knowledge_point_id=kp.knowledge_point_id
            )
            db.add(new_relation)

db.commit()

# 关联题目和动画
problem_animation_relations = [
    {"problem_content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。", "animation_name": "二次函数图像"},
    {"problem_content": "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）", "animation_name": "自由落体模拟"},
    {"problem_content": "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？", "animation_name": "化学反应过程"},
]

for relation in problem_animation_relations:
    problem = db.query(Problem).filter_by(content=relation["problem_content"]).first()
    animation = db.query(Animation).filter_by(name=relation["animation_name"]).first()
    if problem and animation:
        existing = db.query(ProblemAnimation).filter_by(
            problem_id=problem.problem_id,
            animation_id=animation.animation_id
        ).first()
        if not existing:
            new_relation = ProblemAnimation(
                problem_id=problem.problem_id,
                animation_id=animation.animation_id
            )
            db.add(new_relation)

db.commit()

# 初始化解决方案
solutions = [
    {
        "problem_content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。",
        "content": "因为当 x = 1 时取得最小值 2，所以顶点为 (1, 2)，函数可表示为 f(x) = a(x-1)² + 2。又因为图像经过点 (0, 3)，代入得 3 = a(0-1)² + 2，解得 a = 1。所以函数解析式为 f(x) = (x-1)² + 2 = x² - 2x + 3。",
        "steps": "[\"确定顶点坐标 (1, 2)\", \"写出顶点式 f(x) = a(x-1)² + 2\", \"代入点 (0, 3) 求 a\", \"展开得到标准式\"]",
        "difficulty": 3
    },
    {
        "problem_content": "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）",
        "content": "自由落体的位移公式为 h = 1/2 * g * t²，其中 g = 9.8m/s²，t = 2s。代入得 h = 1/2 * 9.8 * 2² = 19.6m。",
        "steps": "[\"回忆自由落体位移公式\", \"代入已知数据\", \"计算结果\"]",
        "difficulty": 2
    },
    {
        "problem_content": "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？",
        "content": "反应方程式为 2H2 + O2 = 2H2O。1mol H2需要0.5mol O2，所以H2是限制反应物。1mol H2完全反应生成1mol H2O。",
        "steps": "[\"写出反应方程式\", \"确定限制反应物\", \"根据化学计量比计算产物量\"]",
        "difficulty": 3
    },
]

for solution in solutions:
    problem = db.query(Problem).filter_by(content=solution["problem_content"]).first()
    if problem:
        existing = db.query(Solution).filter_by(problem_id=problem.problem_id).first()
        if not existing:
            new_solution = Solution(
                problem_id=problem.problem_id,
                content=solution["content"],
                steps=solution["steps"],
                difficulty=solution["difficulty"]
            )
            db.add(new_solution)

db.commit()

print("Initial data loaded successfully!")
db.close()
