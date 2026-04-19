import React, { useRef, useEffect, useState } from 'react'
import './ProbabilityAnimation.css'

const ProbabilityAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    totalBalls: 20,
    redBalls: 8,
    blueBalls: 12,
    drawCount: 3,
    isWithReplacement: false
  })
  const [trials, setTrials] = useState([])
  const [totalTrials, setTotalTrials] = useState(0)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({
    redCount: 0,
    blueCount: 0,
    bothRed: 0,
    bothBlue: 0,
    mixed: 0
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 280
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { totalBalls, redBalls, blueBalls, drawCount, isWithReplacement } = params

    // 绘制标题
    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`概率模拟: 红球${redBalls}个 + 蓝球${blueBalls}个 = ${totalBalls}个`, width / 2, 20)

    // 绘制球箱
    const boxX = 30
    const boxY = 40
    const boxWidth = 120
    const boxHeight = 180

    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 2
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
    ctx.fillStyle = '#374151'
    ctx.font = '11px Inter'
    ctx.fillText('抽奖箱', boxX + boxWidth / 2, boxY + boxHeight + 15)

    // 绘制球
    const ballRadius = 12
    const balls = []
    for (let i = 0; i < redBalls; i++) balls.push('red')
    for (let i = 0; i < blueBalls; i++) balls.push('blue')
    
    const cols = 5
    balls.forEach((color, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = boxX + 15 + col * 22
      const y = boxY + 20 + row * 22

      ctx.beginPath()
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = color === 'red' ? '#EF4444' : '#3B82F6'
      ctx.fill()
      ctx.strokeStyle = color === 'red' ? '#B91C1C' : '#1D4ED8'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // 绘制抽取区
    const drawX = 200
    const drawY = 60
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 2
    ctx.strokeRect(drawX, drawY, 150, 120)
    ctx.fillStyle = '#6366F1'
    ctx.font = '11px Inter'
    ctx.fillText('抽取结果', drawX + 75, drawY + 140)

    // 绘制最近一次抽取
    const recentTrials = trials.slice(-10)
    recentTrials.forEach((trial, index) => {
      const x = drawX + 20 + (index % 5) * 26
      const y = drawY + 30 + Math.floor(index / 5) * 45

      ctx.beginPath()
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = trial.result[0] === 'red' ? '#EF4444' : '#3B82F6'
      ctx.fill()

      if (trial.result.length > 1) {
        ctx.beginPath()
        ctx.arc(x + 18, y, ballRadius, 0, Math.PI * 2)
        ctx.fillStyle = trial.result[1] === 'red' ? '#EF4444' : '#3B82F6'
        ctx.fill()
      }
    })

    // 统计信息
    const statsX = 400
    const statsY = 40

    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('统计结果', statsX, statsY)

    ctx.font = '11px Inter'
    ctx.fillStyle = '#EF4444'
    ctx.fillText(`红球次数: ${stats.redCount}`, statsX, statsY + 25)
    ctx.fillStyle = '#3B82F6'
    ctx.fillText(`蓝球次数: ${stats.blueCount}`, statsX, statsY + 45)
    ctx.fillStyle = '#F59E0B'
    ctx.fillText(`全是红: ${stats.bothRed}`, statsX, statsY + 70)
    ctx.fillStyle = '#8B5CF6'
    ctx.fillText(`全是蓝: ${stats.bothBlue}`, statsX, statsY + 90)
    ctx.fillStyle = '#EC4899'
    ctx.fillText(`混合: ${stats.mixed}`, statsX, statsY + 110)

    // 频率
    const total = totalTrials || 1
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '10px Inter'
    ctx.fillText(`总实验: ${totalTrials}`, statsX, statsY + 135)
    ctx.fillText(`红球频率: ${(stats.redCount / (total * drawCount) * 100).toFixed(1)}%`, statsX, statsY + 150)
    ctx.fillText(`蓝球频率: ${(stats.blueCount / (total * drawCount) * 100).toFixed(1)}%`, statsX, statsY + 165)

    // 理论概率
    ctx.fillStyle = '#6366F1'
    ctx.font = '11px Inter'
    ctx.fillText(`理论红球概率: ${(redBalls / totalBalls * 100).toFixed(1)}%`, 30, 250)
    ctx.fillText(`理论蓝球概率: ${(blueBalls / totalBalls * 100).toFixed(1)}%`, 30, 268)

  }, [params, trials, totalTrials, stats])

  const runTrial = () => {
    const { totalBalls, redBalls, blueBalls, drawCount, isWithReplacement } = params
    
    let balls = []
    for (let i = 0; i < redBalls; i++) balls.push('red')
    for (let i = 0; i < blueBalls; i++) balls.push('blue')

    const result = []
    for (let i = 0; i < drawCount; i++) {
      const index = Math.floor(Math.random() * balls.length)
      result.push(balls[index])
      if (!isWithReplacement) {
        balls.splice(index, 1)
      }
    }

    return { result }
  }

  const runMultipleTrials = (count) => {
    let newStats = { ...stats }
    let newTrials = [...trials]

    for (let i = 0; i < count; i++) {
      const trial = runTrial()
      newTrials.push(trial)
      
      trial.result.forEach(r => {
        if (r === 'red') newStats.redCount++
        else newStats.blueCount++
      })

      if (trial.result.every(r => r === 'red')) newStats.bothRed++
      else if (trial.result.every(r => r === 'blue')) newStats.bothBlue++
      else newStats.mixed++
    }

    setTrials(newTrials.slice(-100))
    setTotalTrials(prev => prev + count)
    setStats(newStats)
  }

  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      runMultipleTrials(10)
    }, 100)

    return () => clearInterval(interval)
  }, [running])

  const handleStart = () => {
    setRunning(true)
  }

  const handleStop = () => {
    setRunning(false)
  }

  const handleReset = () => {
    setRunning(false)
    setTrials([])
    setTotalTrials(0)
    setStats({
      redCount: 0,
      blueCount: 0,
      bothRed: 0,
      bothBlue: 0,
      mixed: 0
    })
  }

  const handleParamChange = (param, value) => {
    if (param === 'totalBalls') {
      const ratio = params.redBalls / params.totalBalls
      setParams(prev => ({
        ...prev,
        totalBalls: parseInt(value),
        redBalls: Math.round(parseInt(value) * ratio),
        blueBalls: Math.round(parseInt(value) * (1 - ratio))
      }))
    } else {
      setParams(prev => ({ ...prev, [param]: parseInt(value) }))
    }
  }

  return (
    <div className="probability-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">总球数: {params.totalBalls}</span>
              <input
                type="range"
                min="5"
                max="50"
                value={params.totalBalls}
                onChange={(e) => handleParamChange('totalBalls', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">红球数: {params.redBalls}</span>
              <input
                type="range"
                min="1"
                max={params.totalBalls - 1}
                value={params.redBalls}
                onChange={(e) => handleParamChange('redBalls', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">抽取数量: {params.drawCount}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={params.drawCount}
                onChange={(e) => handleParamChange('drawCount', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={params.isWithReplacement}
                onChange={(e) => setParams(prev => ({ ...prev, isWithReplacement: e.target.checked }))}
              />
              有放回抽取
            </label>
          </div>
        </div>
      </div>

      <div className="animation-buttons">
        <button className="btn-primary" onClick={handleStart} disabled={running}>▶ 开始</button>
        <button className="btn-secondary" onClick={handleStop} disabled={!running}>⏸ 暂停</button>
        <button className="btn-outline" onClick={handleReset}>🔄 重置</button>
        <button className="btn-outline" onClick={() => runMultipleTrials(100)}>�➕ 100次</button>
      </div>

      <div className="animation-formula">
        <h4>🎲 概率公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">P(A) = n(A)/n(S)</span>
            <span className="formula-desc">古典概型</span>
          </div>
          <div className="formula-item">
            <span className="formula">P(红) = 红球数/总球数</span>
            <span className="formula-desc">红球概率</span>
          </div>
          <div className="formula-item">
            <span className="formula">频率 ≈ 概率</span>
            <span className="formula-desc">大数定律</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProbabilityAnimation