import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './LearningCenter.css'

const LearningCenter = () => {
  const location = useLocation()
  const [subject, setSubject] = useState(new URLSearchParams(location.search).get('subject') || 'all')
  const [problems, setProblems] = useState([])
  const [progress, setProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const allProblems = [
    {
      problem_id: 1,
      content: "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。",
      subject: "math",
      difficulty: "medium",
      knowledge_points: ["二次函数", "顶点式"]
    },
    {
      problem_id: 2,
      content: "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）",
      subject: "physics",
      difficulty: "easy",
      knowledge_points: ["自由落体", "重力加速度"]
    },
    {
      problem_id: 3,
      content: "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？",
      subject: "chemistry",
      difficulty: "medium",
      knowledge_points: ["化学反应", "摩尔计算"]
    },
    {
      problem_id: 4,
      content: "已知一次函数 f(x) = kx + b 的图像经过点 (1, 2) 和 (3, 4)，求函数的解析式。",
      subject: "math",
      difficulty: "easy",
      knowledge_points: ["一次函数", "线性关系"]
    },
    {
      problem_id: 5,
      content: "已知sin x = 1/2，求x在[0, 2π]内的解。",
      subject: "math",
      difficulty: "medium",
      knowledge_points: ["三角函数", "正弦函数"]
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      const filtered = subject === 'all'
        ? allProblems
        : allProblems.filter(p => p.subject === subject)
      setProblems(filtered)
      
      setProgress({
        total_problems: 10,
        completed_problems: 4,
        mastery_level: 40,
        recent_activities: [
          { id: 1, problem_id: 1, subject: "math", completed_at: "2026-04-19 10:00" },
          { id: 2, problem_id: 2, subject: "physics", completed_at: "2026-04-18 15:30" },
          { id: 3, problem_id: 3, subject: "chemistry", completed_at: "2026-04-17 09:15" }
        ]
      })
      
      setIsLoading(false)
    }, 1000)
  }, [subject])

  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject)
    // 这里应该重新获取对应学科的题目
  }

  if (isLoading) {
    return (
      <div className="learning-loading">
        <div className="loading"></div>
        <p>加载学习中心中...</p>
      </div>
    )
  }

  return (
    <div className="learning-center">
      <div className="container">
        <div className="learning-header">
          <h1 className="learning-title">学习中心</h1>
          <p className="learning-description">
            查看你的学习进度，选择题目进行练习
          </p>
        </div>
        
        <div className="learning-content">
          {/* 学习统计 */}
          <div className="learning-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{progress.total_problems}</div>
                <div className="stat-label">总题目数</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{progress.completed_problems}</div>
                <div className="stat-label">已完成</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{progress.mastery_level}%</div>
                <div className="stat-label">掌握程度</div>
              </div>
            </div>
          </div>

          {/* 学科选择 */}
          <div className="subject-filter">
            <button 
              className={`filter-btn ${subject === 'all' ? 'active' : ''}`}
              onClick={() => handleSubjectChange('all')}
            >
              全部
            </button>
            <button 
              className={`filter-btn ${subject === 'math' ? 'active' : ''}`}
              onClick={() => handleSubjectChange('math')}
            >
              数学
            </button>
            <button 
              className={`filter-btn ${subject === 'physics' ? 'active' : ''}`}
              onClick={() => handleSubjectChange('physics')}
            >
              物理
            </button>
            <button 
              className={`filter-btn ${subject === 'chemistry' ? 'active' : ''}`}
              onClick={() => handleSubjectChange('chemistry')}
            >
              化学
            </button>
          </div>

          {/* 题目列表 */}
          <div className="problems-list">
            <h2 className="section-title">题目列表</h2>
            <div className="problems-grid">
              {problems.map((problem) => (
                <Link to={`/problem/${problem.problem_id}`} key={problem.problem_id} className="problem-card">
                  <div className="problem-card-header">
                    <span className="problem-subject">
                      {problem.subject === 'math' ? '数学' : 
                       problem.subject === 'physics' ? '物理' : '化学'}
                    </span>
                    <span className="problem-difficulty">
                      {problem.difficulty === 'easy' ? '简单' : 
                       problem.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                  <div className="problem-card-content">
                    <p className="problem-text">{problem.content}</p>
                    <div className="problem-knowledge-points">
                      {problem.knowledge_points.map((point, index) => (
                        <span key={index} className="knowledge-point">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="problem-card-footer">
                    <span className="problem-action">查看详情</span>
                    <span className="problem-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 最近活动 */}
          <div className="recent-activities">
            <h2 className="section-title">最近活动</h2>
            <div className="activities-list">
              {progress.recent_activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.subject === 'math' ? '📐' : 
                     activity.subject === 'physics' ? '⚡' : '🧪'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      完成了题目 #{activity.problem_id}
                    </div>
                    <div className="activity-subject">
                      {activity.subject === 'math' ? '数学' : 
                       activity.subject === 'physics' ? '物理' : '化学'}
                    </div>
                  </div>
                  <div className="activity-time">
                    {activity.completed_at}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningCenter
