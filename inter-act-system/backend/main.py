# 后端主入口文件
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# 创建FastAPI应用实例
app = FastAPI(
    title="交互式科学教育辅助系统",
    description="通过交互式动画和引导式解题，帮助学生理解科学概念",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
if os.path.exists("../frontend/build"):
    app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="static")

# 导入API路由
from app.api import problems, solutions, animations, cases, users, learning

# 注册API路由
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(solutions.router, prefix="/api/solutions", tags=["solutions"])
app.include_router(animations.router, prefix="/api/animations", tags=["animations"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])

# 根路径
@app.get("/")
async def root():
    return {"message": "交互式科学教育辅助系统 API"}

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
