#!/bin/bash

# 启动前端服务

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js."
    exit 1
fi

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# 安装依赖
echo "Installing dependencies..."
npm install

# 启动开发服务器
echo "Starting frontend development server..."
npm run dev
