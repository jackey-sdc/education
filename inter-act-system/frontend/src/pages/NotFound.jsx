import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-icon">404</div>
          <h1 className="not-found-title">页面不存在</h1>
          <p className="not-found-description">
            抱歉，你访问的页面不存在或已被删除
          </p>
          <Link to="/" className="gradient-btn btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
