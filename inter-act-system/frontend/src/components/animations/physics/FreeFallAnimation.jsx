import React, { useRef, useEffect, useState, useCallback } from 'react'
import './FreeFallAnimation.css'

const FreeFallAnimation = ({ height: initHeight = 100, gravity: initGravity = 9.8 }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [params, setParams] = useState({
    height: initHeight,
    gravity: initGravity
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [distance, setDistance] = useState(0)
  const [trajectory, setTrajectory] = useState([])

  const resetAnimation = useCallback(() => {
    setIsPlaying(false)
    setTime(0)
    setVelocity(0)
    setDistance(0)
    setTrajectory([])
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    resetAnimation()
  }, [params, resetAnimation])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const groundY = height - 50
    const scale = (height - 100) / params.height

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = '#1E293B'
    ctx.fillRect(0, groundY, width, 50)

    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(width, groundY)
    ctx.stroke()

    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px Inter'
    ctx.fillText('地面', 10, groundY - 10)

    ctx.fillStyle = '#94A3B8'
    ctx.font = '11px Inter'
    ctx.textAlign = 'left'
    for (let h = 0; h <= params.height; h += 20) {
      const y = groundY - h * scale
      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.lineTo(40, y)
      ctx.stroke()
      ctx.fillText(`${h}m`, 45, y + 4)
    }

    if (trajectory.length > 1) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      trajectory.forEach((point, index) => {
        const x = width / 2
        const y = groundY - point.distance * scale
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    const currentY = groundY - distance * scale
    const ballX = width / 2
    const ballY = currentY

    const gradient = ctx.createRadialGradient(ballX - 3, ballY - 3, 0, ballX, ballY, 15)
    gradient.addColorStop(0, '#F59E0B')
    gradient.addColorStop(1, '#D97706')
    
    ctx.beginPath()
    ctx.arc(ballX, ballY, 15, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = '#B45309'
    ctx.lineWidth = 2
    ctx.stroke()

    if (isPlaying) {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('⚡', ballX, ballY + 5)
    }

    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'right'
    ctx.fillText(`h = ${distance.toFixed(2)}m`, width - 20, 30)
    ctx.fillText(`v = ${velocity.toFixed(2)}m/s`, width - 20, 50)
    ctx.fillText(`t = ${time.toFixed(2)}s`, width - 20, 70)

  }, [distance, velocity, time, params.height, trajectory, isPlaying])

  const startFall = () => {
    resetAnimation()
    setIsPlaying(true)

    const animate = () => {
      setTime(prevTime => {
        const newTime = prevTime + 0.02
        const fallDistance = 0.5 * params.gravity * newTime * newTime
        const currentVelocity = params.gravity * newTime

        if (fallDistance >= params.height) {
          setDistance(params.height)
          setVelocity(currentVelocity)
          setIsPlaying(false)
          return params.height
        }

        setDistance(fallDistance)
        setVelocity(currentVelocity)
        setTrajectory(prev => [...prev, { time: newTime, distance: fallDistance }])

        if (isPlaying && fallDistance < params.height) {
          animationRef.current = requestAnimationFrame(animate)
        }

        return newTime
      })
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const stopFall = () => {
    setIsPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleHeightChange = (value) => {
    setParams(prev => ({ ...prev, height: parseFloat(value) }))
  }

  const handleGravityChange = (value) => {
    setParams(prev => ({ ...prev, gravity: parseFloat(value) }))
  }

  const theoreticalTime = Math.sqrt(2 * params.height / params.gravity).toFixed(2)
  const theoreticalVelocity = params.gravity * parseFloat(theoreticalTime)

  return (
    <div className="free-fall-animation">
      <div className="animation-canvas-container">
        <canvas
          ref={canvasRef}
          className="animation-canvas"
        />
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">当前时间</span>
            <span className="data-value">{time.toFixed(2)}s</span>
          </div>
          <div className="data-item">
            <span className="data-label">当前速度</span>
            <span className="data-value">{velocity.toFixed(2)}m/s</span>
          </div>
          <div className="data-item">
            <span className="data-label">下落距离</span>
            <span className="data-value">{distance.toFixed(2)}m</span>
          </div>
        </div>
        <div className="data-row">
          <div className="data-item highlight">
            <span className="data-label">理论落地时间</span>
            <span className="data-value">{theoreticalTime}s</span>
          </div>
          <div className="data-item highlight">
            <span className="data-label">落地速度</span>
            <span className="data-value">{theoreticalVelocity.toFixed(2)}m/s</span>
          </div>
        </div>
      </div>

      <div className="animation-controls">
        <div className="control-group">
          <label>
            <span className="control-label">初始高度 (h)</span>
            <input
              type="range"
              min="20"
              max="200"
              step="1"
              value={params.height}
              onChange={(e) => handleHeightChange(e.target.value)}
            />
            <span className="control-value">{params.height}m</span>
          </label>
        </div>

        <div className="control-group">
          <label>
            <span className="control-label">重力加速度 (g)</span>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={params.gravity}
              onChange={(e) => handleGravityChange(e.target.value)}
            />
            <span className="control-value">{params.gravity.toFixed(1)}m/s²</span>
          </label>
        </div>
      </div>

      <div className="animation-buttons">
        <button 
          className="btn-primary"
          onClick={startFall}
          disabled={isPlaying}
        >
          {isPlaying ? '下落中...' : '开始下落'}
        </button>
        <button 
          className="btn-secondary"
          onClick={stopFall}
          disabled={!isPlaying}
        >
          暂停
        </button>
        <button 
          className="btn-outline"
          onClick={resetAnimation}
        >
          重置
        </button>
      </div>

      <div className="animation-formula">
        <h4>自由落体公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">h = ½gt²</span>
            <span className="formula-desc">下落距离</span>
          </div>
          <div className="formula-item">
            <span className="formula">v = gt</span>
            <span className="formula-desc">瞬时速度</span>
          </div>
          <div className="formula-item">
            <span className="formula">v² = 2gh</span>
            <span className="formula-desc">速度位移关系</span>
          </div>
        </div>
      </div>

      <div className="animation-hint">
        <p>💡 拖动滑块调整高度和重力加速度，点击"开始下落"观察物体运动</p>
      </div>
    </div>
  )
}

export default FreeFallAnimation
