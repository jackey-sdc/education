import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 模拟登录请求
    setTimeout(() => {
      if (username === 'test' && password === 'password') {
        // 登录成功
        localStorage.setItem('token', 'mock-token')
        navigate('/')
      } else {
        setError('用户名或密码错误')
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="login">
      <div className="container">
        <div className="login-content">
          <div className="login-header">
            <h1 className="login-title">登录</h1>
            <p className="login-description">
              登录你的账号，开始交互式学习之旅
            </p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                用户名
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="请输入用户名"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="gradient-btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading"></div>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
            
            <div className="form-footer">
              <p>还没有账号？ <Link to="/register">立即注册</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
