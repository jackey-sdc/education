import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    // 模拟注册请求
    setTimeout(() => {
      // 模拟注册成功
      setSuccess('注册成功，正在跳转到登录页面...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="register">
      <div className="container">
        <div className="register-content">
          <div className="register-header">
            <h1 className="register-title">注册</h1>
            <p className="register-description">
              创建新账号，开始交互式学习之旅
            </p>
          </div>
          
          <form className="register-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                {success}
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
              <label htmlFor="email" className="form-label">
                邮箱
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="请输入邮箱"
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
                placeholder="请输入密码（至少6位）"
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                确认密码
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="请再次输入密码"
                minLength={6}
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
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </button>
            </div>
            
            <div className="form-footer">
              <p>已有账号？ <Link to="/login">立即登录</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
