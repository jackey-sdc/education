import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QuadraticFunctionAnimation } from '../components/animations'
import { FreeFallAnimation } from '../components/animations'
import { ReactionAnimation } from '../components/animations'
import FunctionGraphAnimation from '../components/animations/math/FunctionGraphAnimation'
import { getAnimationForProblem } from '../components/animations/knowledgeMapping'
import './Problem.css'

const Problem = () => {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [solution, setSolution] = useState(null)
  const [cases, setCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [animationMapping, setAnimationMapping] = useState(null)

  useEffect(() => {
    setTimeout(() => {
      const problemData = {
        1: {
          problem_id: 1,
          content: "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。",
          subject: "math",
          difficulty: "medium",
          knowledge_points: ["二次函数", "顶点式", "最小值"]
        },
        2: {
          problem_id: 2,
          content: "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）",
          subject: "physics",
          difficulty: "easy",
          knowledge_points: ["自由落体", "重力加速度", "速度", "加速度"]
        },
        3: {
          problem_id: 3,
          content: "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？",
          subject: "chemistry",
          difficulty: "medium",
          knowledge_points: ["化学反应", "摩尔", "燃烧反应", "化学方程式"]
        },
        4: {
          problem_id: 4,
          content: "已知一次函数 f(x) = kx + b 的图像经过点 (1, 2) 和 (3, 4)，求函数的解析式。",
          subject: "math",
          difficulty: "easy",
          knowledge_points: ["一次函数", "线性关系", "斜率"]
        },
        5: {
          problem_id: 5,
          content: "已知sin x = 1/2，求x在[0, 2π]内的解。",
          subject: "math",
          difficulty: "medium",
          knowledge_points: ["三角函数", "正弦函数", "周期"]
        }
      }

      const solutionData = {
        1: {
          solution_id: 1,
          content: "因为当 x = 1 时取得最小值 2，所以顶点为 (1, 2)，函数可表示为 f(x) = a(x-1)² + 2。又因为图像经过点 (0, 3)，代入得 3 = a(0-1)² + 2，解得 a = 1。所以函数解析式为 f(x) = (x-1)² + 2 = x² - 2x + 3。",
          steps: ["确定顶点坐标 (1, 2)", "写出顶点式 f(x) = a(x-1)² + 2", "代入点 (0, 3) 求 a", "展开得到标准式"]
        },
        2: {
          solution_id: 2,
          content: "根据自由落体公式 h = ½gt²，代入 g = 9.8m/s²，t = 2s，得 h = ½ × 9.8 × 2² = ½ × 9.8 × 4 = 19.6m。因此物体下落的高度为19.6米。",
          steps: ["识别这是自由落体运动", "写出自由落体公式 h = ½gt²", "代入已知数据 g=9.8m/s², t=2s", "计算得出 h = 19.6m"]
        },
        3: {
          solution_id: 3,
          content: "根据化学方程式 2H₂ + O₂ → 2H₂O，可知每2mol H₂与1mol O₂反应生成2mol H₂O。当H₂和O₂的物质的量为1mol时，O₂是过量的，按H₂计算，生成1mol H₂O。",
          steps: ["写出并配平化学方程式", "确定反应物物质的量关系", "判断哪种反应物过量", "按不足量计算产物量"]
        },
        4: {
          solution_id: 4,
          content: "设一次函数为 f(x) = kx + b。代入点 (1, 2) 得 2 = k + b；代入点 (3, 4) 得 4 = 3k + b。两式相减得 2 = 2k，所以 k = 1。代入得 b = 1。所以函数解析式为 f(x) = x + 1。",
          steps: ["设一次函数为 f(x) = kx + b", "代入点 (1, 2) 得方程1", "代入点 (3, 4) 得方程2", "解方程组求 k 和 b"]
        },
        5: {
          solution_id: 5,
          content: "已知 sin x = 1/2，在[0, 2π]内，正弦值等于1/2的角度有两个：x = π/6 和 x = 5π/6。",
          steps: ["回忆 sin x = 1/2 的特殊角", "确定第一象限角 x = π/6", "确定第二象限角 x = π - π/6 = 5π/6", "验证解在给定区间内"]
        }
      }

      const selectedProblem = problemData[id] || problemData[1]
      const selectedSolution = solutionData[id] || solutionData[1]

      setProblem(selectedProblem)
      setSolution(selectedSolution)

      const mapping = getAnimationForProblem(selectedProblem)
      setAnimationMapping(mapping)

      setCases([
        {
          case_id: 1,
          title: selectedProblem.subject === 'math' ? "建筑中的抛物线应用" :
                 selectedProblem.subject === 'physics' ? "蹦极跳中的物理原理" : "火箭燃料的燃烧反应",
          description: selectedProblem.subject === 'math' ? "在建筑设计中，二次函数用于计算抛物线形屋顶的结构。例如，某些体育馆的屋顶采用抛物线形状，既美观又能承受较大的荷载。" :
                      selectedProblem.subject === 'physics' ? "蹦极跳是一项刺激的极限运动，其原理就是自由落体运动。通过控制绳子的长度和弹性，可以确保运动员安全着地。" :
                      "火箭发射时，液氢和液氧在燃烧室内剧烈燃烧，产生巨大的推力。这个反应也是氢气和氧气的化合反应。",
          type: "industry"
        },
        {
          case_id: 2,
          title: selectedProblem.subject === 'math' ? "投篮中的抛物线" :
                 selectedProblem.subject === 'physics' ? "跳伞运动中的匀速下落" : "家庭燃料电池",
          description: selectedProblem.subject === 'math' ? "篮球运动员投篮时，篮球的运动轨迹是一条抛物线。通过二次函数的知识，可以计算出投篮的最佳角度和力度，提高投篮命中率。" :
                      selectedProblem.subject === 'physics' ? "当跳伞运动员打开降落伞后，空气阻力与重力平衡，进入匀速下落阶段。这个阶段的速度称为终极速度。" :
                      "氢气作为清洁能源，可以用于燃料电池汽车。氢气和氧气在催化剂作用下发生反应，生成水并释放电能。",
          type: "daily_life"
        }
      ])

      setIsLoading(false)
    }, 500)
  }, [id])

  if (isLoading) {
    return (
      <div className="problem-loading">
        <div className="loading"></div>
        <p>加载题目中...</p>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="problem-not-found">
        <h2>题目不存在</h2>
        <p>请检查题目ID是否正确</p>
        <Link to="/" className="gradient-btn">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="problem">
      <div className="container">
        <div className="problem-header">
          <Link to="/learning" className="back-link">
            ← 返回学习中心
          </Link>
          <h1 className="problem-title">题目详情</h1>
        </div>

        <div className="problem-content">
          <div className="problem-info">
            <div className="problem-meta">
              <span className="problem-subject">
                {problem.subject === 'math' ? '📐 数学' :
                 problem.subject === 'physics' ? '⚡ 物理' : '🧪 化学'}
              </span>
              <span className="problem-difficulty">
                {problem.difficulty === 'easy' ? '⭐ 简单' :
                 problem.difficulty === 'medium' ? '⭐⭐ 中等' : '⭐⭐⭐ 困难'}
              </span>
            </div>
            <div className="problem-text">
              <p>{problem.content}</p>
            </div>
            <div className="problem-knowledge-points">
              <h3>📚 知识点</h3>
              <div className="knowledge-points-list">
                {problem.knowledge_points.map((point, index) => (
                  <span key={index} className="knowledge-point">
                    {point}
                  </span>
                ))}
              </div>
            </div>
            {animationMapping && (
              <div className="animation-match-info">
                <span className="match-label">匹配动画:</span>
                <span className="match-value">{animationMapping.description}</span>
              </div>
            )}
          </div>

          <div className="problem-animation">
            <h3>🎮 交互式动画</h3>
            {animationMapping && animationMapping.component === 'QuadraticFunctionAnimation' && (
              <QuadraticFunctionAnimation {...animationMapping.problemData.initialParams} />
            )}
            {animationMapping && animationMapping.component === 'FreeFallAnimation' && (
              <FreeFallAnimation {...animationMapping.problemData.initialParams} />
            )}
            {animationMapping && animationMapping.component === 'ReactionAnimation' && (
              <ReactionAnimation {...animationMapping.problemData.initialParams} />
            )}
            {animationMapping && animationMapping.component === 'FunctionGraphAnimation' && (
              <FunctionGraphAnimation problemData={animationMapping.problemData} />
            )}
            {animationMapping && animationMapping.component === 'GenericAnimation' && (
              <div className="generic-animation-placeholder">
                <p>该知识点动画正在开发中...</p>
              </div>
            )}
          </div>

          <div className="problem-solution">
            <div className="solution-header">
              <h3>📝 解题步骤</h3>
              <button
                className="toggle-solution"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? '🔒 隐藏解答' : '🔓 显示解答'}
              </button>
            </div>
            {showSolution && (
              <div className="solution-content">
                <div className="solution-steps">
                  {solution.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`solution-step ${activeStep === index ? 'active' : ''}`}
                      onClick={() => setActiveStep(index)}
                    >
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">{step}</div>
                    </div>
                  ))}
                </div>
                <div className="solution-explanation">
                  <h4>💡 详细解释</h4>
                  <p>{solution.content}</p>
                </div>
              </div>
            )}
          </div>

          <div className="problem-cases">
            <h3>🌍 实际应用案例</h3>
            <div className="cases-list">
              {cases.map((caseItem) => (
                <div key={caseItem.case_id} className="case-card">
                  <div className="case-type">
                    {caseItem.type === 'industry' ? '🏭 工业应用' :
                     caseItem.type === 'daily_life' ? '🏠 日常生活' : '🔬 科学研究'}
                  </div>
                  <h4 className="case-title">{caseItem.title}</h4>
                  <p className="case-description">{caseItem.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="problem-actions">
            <Link to="/learning" className="btn-secondary">
              查看更多题目
            </Link>
            <button className="gradient-btn">
              ✅ 标记为已掌握
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Problem
