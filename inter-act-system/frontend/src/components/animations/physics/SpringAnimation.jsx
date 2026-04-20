import React, { useRef, useEffect, useState, useCallback } from 'react'
import './SpringAnimation.css'

const SpringAnimation = ({}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const playingRef = useRef(false)
  const [params, setParams] = useState({
    mass: 2,
    springConstant: 50,
    damping: 0.5,
    amplitude: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [state, setState] = useState({
    displacement: 80,
    velocity: 0,
    time: 0
  })
  const [trajectory, setTrajectory] = useState([])

  const resetAnimation = useCallback(() => {
    setIsPlaying(false)
    playingRef.current = false
    setState({ displacement: params.amplitude, velocity: 0, time: 0 })
    setTrajectory([])
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [params.amplitude])

  useEffect(() => {
    resetAnimation()
  }, [params, resetAnimation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const { mass, springConstant, damping } = params
    const centerY = height / 2
    const equilibriumX = width / 2

    // 绘制天花板
    ctx.fillStyle = '#374151'
    ctx.fillRect(0, 0, width, 30)
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, 30)
    ctx.lineTo(width, 30)
    ctx.stroke()

    // 弹簧参数
    const maxSpringLength = 150
    const currentDisplacement = state.displacement
    const springLength = maxSpringLength - currentDisplacement

    // 绘制弹簧
    const springTop = 30
    const springBottom = springTop + springLength
    const coils = 12
    const coilWidth = 20

    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.moveTo(equilibriumX, springTop)
    for (let i = 0; i <= coils; i++) {
      const y = springTop + (springLength * i) / coils
      const x = equilibriumX + (i % 2 === 0 ? coilWidth : -coilWidth)
      if (i === 0) {
        ctx.moveTo(equilibriumX, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.lineTo(equilibriumX, springBottom)
    ctx.stroke()

    // 绘制质量块
    const blockWidth = 60
    const blockHeight = 40
    const blockX = equilibriumX - blockWidth / 2
    const blockY = springBottom

    // 质量块阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(blockX + 5, blockY + 5, blockWidth, blockHeight)

    // 质量块
    const gradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockHeight)
    gradient.addColorStop(0, '#F59E0B')
    gradient.addColorStop(1, '#D97706')
    ctx.fillStyle = gradient
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight)
    ctx.strokeStyle = '#B45309'
    ctx.lineWidth = 2
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight)

    // 质量标注
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`m = ${mass} kg`, equilibriumX, blockY + blockHeight / 2 + 5)

    // 平衡位置线（虚线）
    const eqY = springTop + maxSpringLength
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(equilibriumX - 80, eqY)
    ctx.lineTo(equilibriumX + 80, eqY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#6366F1'
    ctx.font = '11px Inter'
    ctx.fillText('平衡位置', equilibriumX + 50, eqY - 5)

    // 伸长量标注
    if (Math.abs(currentDisplacement) > 10) {
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(equilibriumX + 50, eqY)
      ctx.lineTo(equilibriumX + 50, springBottom)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#10B981'
      ctx.font = 'bold 11px Inter'
      const displacementText = currentDisplacement > 0 ? `+${currentDisplacement.toFixed(1)}` : currentDisplacement.toFixed(1)
      ctx.fillText(`x = ${displacementText}`, equilibriumX + 60, (eqY + springBottom) / 2)
    }

    // 受力箭头
    if (Math.abs(currentDisplacement) > 5) {
      const k = springConstant
      const restoringForce = k * currentDisplacement * 0.3
      const forceDirection = currentDisplacement > 0 ? -1 : 1

      ctx.strokeStyle = '#EF4444'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(equilibriumX, blockY + (currentDisplacement > 0 ? 0 : blockHeight))
      ctx.lineTo(equilibriumX, blockY + (currentDisplacement > 0 ? 0 : blockHeight) + restoringForce * forceDirection)
      ctx.stroke()

      // 箭头
      const arrowHeadSize = 10
      const arrowEndY = blockY + (currentDisplacement > 0 ? 0 : blockHeight) + restoringForce * forceDirection
      ctx.beginPath()
      ctx.moveTo(equilibriumX, arrowEndY)
      ctx.lineTo(equilibriumX - arrowHeadSize / 2, arrowEndY - arrowHeadSize * forceDirection)
      ctx.lineTo(equilibriumX + arrowHeadSize / 2, arrowEndY - arrowHeadSize * forceDirection)
      ctx.closePath()
      ctx.fillStyle = '#EF4444'
      ctx.fill()

      ctx.fillStyle = '#EF4444'
      ctx.font = 'bold 11px Inter'
      ctx.fillText(`F = ${Math.abs(restoringForce / 0.3).toFixed(1)} N`, equilibriumX + 40, arrowEndY)
    }

    // 轨迹图
    const graphX = 30
    const graphY = height - 100
    const graphWidth = 120
    const graphHeight = 70

    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'
    ctx.fillRect(graphX - 5, graphY - 15, graphWidth + 10, graphHeight + 25)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(graphX - 5, graphY - 15, graphWidth + 10, graphHeight + 25)

    ctx.fillStyle = '#9CA3AF'
    ctx.font = '10px Inter'
    ctx.fillText('位移-时间', graphX, graphY - 3)

    // 绘制轨迹
    if (trajectory.length > 1) {
      ctx.strokeStyle = '#6366F1'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      trajectory.forEach((point, index) => {
        const x = graphX + (index / 200) * graphWidth
        const y = graphY + graphHeight / 2 - (point.displacement / 100) * (graphHeight / 2)
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // 数据面板
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(width - 180, 20, 160, 110)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(width - 180, 20, 160, 110)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('弹簧振子数据', width - 165, 40)
    ctx.font = '11px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`时间: ${state.time.toFixed(2)}s`, width - 165, 60)
    ctx.fillText(`位移: ${state.displacement.toFixed(2)}m`, width - 165, 78)
    ctx.fillText(`速度: ${state.velocity.toFixed(2)}m/s`, width - 165, 96)
    ctx.fillText(`周期: ${(2 * Math.PI * Math.sqrt(mass / springConstant)).toFixed(2)}s`, width - 165, 114)

  }, [params, state, trajectory])

  const startSimulation = () => {
    resetAnimation()
    setIsPlaying(true)
    playingRef.current = true
    setState({ displacement: params.amplitude, velocity: 0, time: 0 })

    const animate = () => {
      setState(prev => {
        const { mass, springConstant, damping } = params
        const omega = Math.sqrt(springConstant / mass)
        const dt = 0.016

        // 简谐运动 + 阻尼
        const A = params.amplitude
        const decay = Math.exp(-damping * prev.time / (2 * mass))
        const newDisplacement = A * Math.cos(omega * (prev.time + dt)) * decay
        const newVelocity = -A * omega * Math.sin(omega * (prev.time + dt)) * decay - (damping / (2 * mass)) * newDisplacement

        const newTime = prev.time + dt

        if (newTime > 20) {
          setIsPlaying(false)
          playingRef.current = false
        }

        setTrajectory(trajectory => [...trajectory.slice(-199), { time: newTime, displacement: newDisplacement }])

        return {
          displacement: newDisplacement,
          velocity: newVelocity,
          time: newTime
        }
      })

      if (playingRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  const period = (2 * Math.PI * Math.sqrt(params.mass / params.springConstant)).toFixed(2)
  const frequency = (1 / period).toFixed(2)

  return (
    <div className="spring-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">位移</span>
            <span className="data-value">{state.displacement.toFixed(1)}m</span>
          </div>
          <div className="data-item">
            <span className="data-label">速度</span>
            <span className="data-value">{state.velocity.toFixed(1)}m/s</span>
          </div>
          <div className="data-item highlight">
            <span className="data-label">周期</span>
            <span className="data-value">{period}s</span>
          </div>
        </div>
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">质量 m: {params.mass}kg</span>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={params.mass}
                onChange={(e) => handleParamChange('mass', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">劲度系数 k: {params.springConstant}N/m</span>
              <input
                type="range"
                min="10"
                max="100"
                value={params.springConstant}
                onChange={(e) => handleParamChange('springConstant', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">阻尼 c: {params.damping}</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={params.damping}
                onChange={(e) => handleParamChange('damping', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">振幅 A: {params.amplitude}m</span>
              <input
                type="range"
                min="20"
                max="120"
                value={params.amplitude}
                onChange={(e) => handleParamChange('amplitude', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-buttons">
        <button className="btn-primary" onClick={startSimulation} disabled={isPlaying}>▶ 开始</button>
        <button className="btn-secondary" onClick={resetAnimation}>🔄 重置</button>
      </div>

      <div className="animation-formula">
        <h4>🔄 弹簧振子公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">T = 2π√(m/k)</span>
            <span className="formula-desc">固有周期</span>
          </div>
          <div className="formula-item">
            <span className="formula">f = 1/T</span>
            <span className="formula-desc">频率</span>
          </div>
          <div className="formula-item">
            <span className="formula">x = Acos(ωt)</span>
            <span className="formula-desc">位移</span>
          </div>
          <div className="formula-item">
            <span className="formula">F = -kx</span>
            <span className="formula-desc">胡克定律</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpringAnimation