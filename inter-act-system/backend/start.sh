#!/bin/bash

# 启动后端服务

# 检查是否安装了Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3."
    exit 1
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "Activating virtual environment..."
source venv/bin/activate

# 安装依赖
echo "Installing dependencies..."
pip install -r requirements.txt

# 初始化数据库
echo "Initializing database..."
python app/utils/init_db.py

# 启动服务
echo "Starting backend service..."
python main.py
