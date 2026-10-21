@echo off

REM 启动前端服务

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js.
    pause
    exit /b 1
)

REM 检查是否安装了npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm.
    pause
    exit /b 1
)

REM 安装依赖
echo Installing dependencies...
npm install

REM 启动开发服务器
echo Starting frontend development server...
npm run dev

pause
