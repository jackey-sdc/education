import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 模拟登录状态
  const isLoggedIn = false

  const handleLogout = (e) => {
    e.preventDefault()
    // 这里应该清除token和用户信息
    navigate('/login')
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🔬</span>
            <span className="logo-text">科学助手</span>
          </Link>
          
          <div className="navbar-links">
            <Link to="/" className="navbar-link">首页</Link>
            <Link to="/learning" className="navbar-link">学习中心</Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="navbar-link">个人中心</Link>
                <a href="#" className="navbar-link" onClick={handleLogout}>退出登录</a>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">登录</Link>
                <Link to="/register" className="navbar-link gradient-btn">注册</Link>
              </>
            )}
          </div>
          
          <div className="navbar-menu">
            <button 
              className="menu-toggle" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="navbar-mobile">
            <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>首页</Link>
            <Link to="/learning" className="mobile-link" onClick={() => setIsMenuOpen(false)}>学习中心</Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>个人中心</Link>
                <a href="#" className="mobile-link" onClick={(e) => {
                  e.preventDefault()
                  handleLogout(e)
                  setIsMenuOpen(false)
                }}>退出登录</a>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>登录</Link>
                <Link to="/register" className="mobile-link gradient-btn" onClick={() => setIsMenuOpen(false)}>注册</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
