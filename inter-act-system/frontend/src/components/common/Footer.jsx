import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🔬</span>
              <span className="logo-text">科学助手</span>
            </div>
            <p className="footer-description">
              交互式科学教育辅助系统，通过动画和引导式解题，帮助学生理解科学概念
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">快速链接</h4>
            <ul className="footer-links">
              <li><Link to="/">首页</Link></li>
              <li><Link to="/learning">学习中心</Link></li>
              <li><Link to="/login">登录</Link></li>
              <li><Link to="/register">注册</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">联系我们</h4>
            <ul className="footer-links">
              <li>邮箱：contact@science-helper.com</li>
              <li>电话：123-456-7890</li>
              <li>地址：北京市海淀区中关村</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">关注我们</h4>
            <div className="social-links">
              <a href="#" className="social-link">微信</a>
              <a href="#" className="social-link">微博</a>
              <a href="#" className="social-link">B站</a>
              <a href="#" className="social-link">知乎</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} 科学助手. 保留所有权利.
          </p>
          <div className="footer-terms">
            <a href="#">隐私政策</a>
            <a href="#">使用条款</a>
            <a href="#">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
