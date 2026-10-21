import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  // 学科数据
  const subjects = [
    {
      id: 'math',
      icon: '📐',
      title: '数学',
      description: '几何图形变换、函数图像绘制、概率分布可视化',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'physics',
      icon: '⚡',
      title: '物理',
      description: '力学运动模拟、电磁现象可视化、光学实验模拟',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'chemistry',
      icon: '🧪',
      title: '化学',
      description: '分子结构动态展示、化学反应过程动画、元素周期表交互',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  // 核心功能
  const features = [
    {
      icon: '🧠',
      title: '智能题目分析',
      description: '使用NLP技术解析题目内容，识别知识点和解题步骤'
    },
    {
      icon: '🎮',
      title: '交互式动画',
      description: '根据题目类型生成相应的可视化动画，帮助理解抽象概念'
    },
    {
      icon: '👨‍🏫',
      title: '引导式解题',
      description: '基于题目难度和学生水平，提供分步骤引导和交互式问答'
    },
    {
      icon: '🌍',
      title: '实际应用关联',
      description: '关联题目知识点与工业、生活实际应用案例，建立知识联系'
    },
    {
      icon: '📊',
      title: '学习进度追踪',
      description: '记录学生解题过程和掌握情况，提供个性化学习建议'
    },
    {
      icon: '📱',
      title: '多设备适配',
      description: '响应式设计，支持PC、平板和移动设备，随时随地学习'
    }
  ]

  return (
    <div className="home">
      {/* 英雄区域 */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="hero-title-gradient">交互式</span>科学教育辅助系统
              </h1>
              <p className="hero-description">
                通过动画和引导式解题，帮助学生理解科学概念，建立知识与实践的联系
              </p>
              <div className="hero-buttons">
                <Link to="/learning" className="gradient-btn btn-primary">
                  开始学习
                </Link>
                <Link to="/login" className="btn-secondary">
                  登录
                </Link>
              </div>
            </div>
            <div className="hero-animation">
              <div className="animation-container">
                <div className="animation-item math">📐</div>
                <div className="animation-item physics">⚡</div>
                <div className="animation-item chemistry">🧪</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学科选择 */}
      <section className="subjects">
        <div className="container">
          <h2 className="section-title">选择学科</h2>
          <p className="section-description">
            选择你感兴趣的学科，开始交互式学习之旅
          </p>
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <Link to={`/learning?subject=${subject.id}`} key={subject.id} className="subject-card">
                <div className={`subject-icon bg-gradient-to-br ${subject.color}`}>
                  {subject.icon}
                </div>
                <h3 className="subject-title">{subject.title}</h3>
                <p className="subject-description">{subject.description}</p>
                <button className="subject-btn gradient-btn">
                  开始学习
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">核心功能</h2>
          <p className="section-description">
            我们的系统提供多种功能，帮助学生更有效地学习科学知识
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 应用场景 */}
      <section className="use-cases">
        <div className="container">
          <h2 className="section-title">应用场景</h2>
          <p className="section-description">
            我们的系统适用于多种学习场景，满足不同用户的需求
          </p>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">🏫</div>
              <h3 className="use-case-title">课堂教学</h3>
              <p className="use-case-description">
                教师可使用系统进行演示，增强课堂互动性，学生可在课堂上实时操作
              </p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">📚</div>
              <h3 className="use-case-title">自主学习</h3>
              <p className="use-case-description">
                学生可独立使用系统，获取个性化学习体验，家长可了解孩子的学习进度
              </p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">🏢</div>
              <h3 className="use-case-title">教育机构</h3>
              <p className="use-case-description">
                培训机构可将系统作为教学辅助工具，教育科技公司可基于此系统开发商业产品
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 行动召唤 */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">开始你的科学学习之旅</h2>
            <p className="cta-description">
              加入我们，体验交互式科学教育的魅力，让学习变得更加有趣和有效
            </p>
            <Link to="/register" className="gradient-btn btn-primary">
              立即注册
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
