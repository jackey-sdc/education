import React, { useRef, useEffect, useState, useCallback } from 'react'
import './MechanicsAnimation.css'

const MechanicsAnimation = ({}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [params, setParams] = useState({
    mass: 5,
    force: 20,
    friction: 0.2,
    angle: 30
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [state, setState] = useState({
    position: 50,
    velocity: 0,
    time: 0
  })
  const [trajectory, setTrajectory] = useState([])

  const resetAnimation = useCallback(() => {
    setIsPlaying(false)
    setState({ position: 50, velocity: 0, time: 0 })
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

    ctx.clearRect(0, 0, width, height)

    const { mass, force, friction, angle } = params
    const angleRad = (angle * Math.PI) / 180
    const g = 9.8

    // 斜面参数
    const slopeLength = 300
    const slopeHeight = slopeLength * Math.sin(angleRad)
    const groundY = height - 60
    const slopeStartX = 80
    const slopeStartY = groundY
    const slopeEndX = slopeStartX + slopeLength * Math.cos(angleRad)
    const slopeEndY = slopeStartY - slopeHeight

    // 绘制地面
    ctx.fillStyle = '#374151'
    ctx.fillRect(0, groundY, width, 60)
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(width, groundY)
    ctx.stroke()

    // 绘制斜面
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(slopeStartX, slopeStartY)
    ctx.lineTo(slopeEndX, slopeEndY)
    ctx.stroke()

    // 斜面角度标注
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px Inter'
    ctx.fillText(`θ = ${angle}°`, slopeStartX + 20, slopeStartY - 10)

    // 计算物体在斜面上的位置
    const progress = state.position / 100
    const objectX = slopeStartX + progress * (slopeEndX - slopeStartX)
    const objectY = slopeStartY - progress * (slopeEndY - slopeStartY)

    // 物体（方块）
    const blockSize = 30
    ctx.save()
    ctx.translate(objectX, objectY)
    ctx.rotate(-angleRad)

    // 绘制方块
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize)
    ctx.strokeStyle = '#B45309'
    ctx.lineWidth = 2
    ctx.strokeRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize)

    // 质量标注
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`m=${mass}kg`, 0, 4)
    ctx.restore()

    // 绘制受力分析
    const forceScale = 0.3
    const fg = mass * g
    const fgY = fg * forceScale

    // 重力
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(objectX, objectY + fgY)
    ctx.stroke()
    ctx.fillStyle = '#EF4444'
    ctx.font = 'bold 11px Inter'
    ctx.fillText(`G=${(fg).toFixed(1)}N`, objectX + 15, objectY + fgY / 2)

    // 重力分解 - 沿斜面方向
    const fgParallel = fg * Math.sin(angleRad)
    const fgParallelLen = fgParallel * forceScale
    ctx.strokeStyle = '#10B981'
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(objectX + fgParallelLen * Math.cos(angleRad), objectY + fgParallelLen * Math.sin(angleRad))
    ctx.stroke()
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 11px Inter'
    ctx.fillText(`G∥=${(fgParallel).toFixed(1)}N`, objectX + fgParallelLen * Math.cos(angleRad) / 2 + 20, objectY + fgParallelLen * Math.sin(angleRad) / 2)

    // 摩擦力
    const fn = fg * Math.cos(angleRad)
    const frictionForce = fn * friction
    ctx.strokeStyle = '#3B82F6'
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(objectX - fgParallelLen * Math.cos(angleRad), objectY - fgParallelLen * Math.sin(angleRad))
    ctx.stroke()
    ctx.fillStyle = '#3B82F6'
    ctx.fillText(`f=${(frictionForce).toFixed(1)}N`, objectX - fgParallelLen * Math.cos(angleRad) / 2 - 25, objectY - fgParallelLen * Math.sin(angleRad) / 2)

    // 合力
    const netForce = fgParallel - frictionForce - force * Math.cos(angleRad)
    ctx.strokeStyle = '#EC4899'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(objectX + (netForce > 0 ? fgParallelLen : fgParallelLen + netForce * forceScale * 2) * Math.cos(angleRad), 
               objectY + (netForce > 0 ? fgParallelLen : fgParallelLen + netForce * forceScale * 2) * Math.sin(angleRad))
    ctx.stroke()
    ctx.fillStyle = '#EC4899'
    ctx.font = 'bold 11px Inter'
    ctx.fillText(`F合=${(netForce).toFixed(1)}N`, objectX + 30, objectY - 20)

    // 轨迹
    if (trajectory.length > 1) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      trajectory.forEach((point, index) => {
        const px = slopeStartX + point.position / 100 * (slopeEndX - slopeStartX)
        const py = slopeStartY - point.position / 100 * (slopeEndY - slopeStartY)
        if (index === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      })
      ctx.stroke()
    }

    // 数据面板
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(width - 180, 20, 160, 100)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(width - 180, 20, 160, 100)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('运动数据', width - 165, 40)
    ctx.font = '11px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`时间: ${state.time.toFixed(2)}s`, width - 165, 60)
    ctx.fillText(`位移: ${(state.position * 3).toFixed(1)}m`, width - 165, 78)
    ctx.fillText(`速度: ${state.velocity.toFixed(2)}m/s`, width - 165, 96)
    ctx.fillText(`加速度: ${(netForce / mass).toFixed(2)}m/s²`, width - 165, 114)

  }, [params, state, trajectory])

  const startSimulation = () => {
    resetAnimation()
    setIsPlaying(true)

    const animate = () => {
      setState(prev => {
        const { mass, force, friction, angle } = params
        const angleRad = (angle * Math.PI) / 180
        const g = 9.8

        const fg = mass * g
        const fgParallel = fg * Math.sin(angleRad)
        const fn = fg * Math.cos(angleRad)
        const frictionForce = fn * friction
        const netForce = fgParallel - frictionForce - force * Math.cos(angleRad)
        const acceleration = netForce / mass

        const newVelocity = prev.velocity + acceleration * 0.02
        const newPosition = prev.position + (newVelocity * 0.02 * 100) / 3

        if (newPosition >= 100 || newPosition <= 0) {
          setIsPlaying(false)
          return { ...prev, velocity: 0 }
        }

        setTrajectory(trajectory => [...trajectory, { time: prev.time, position: newPosition }])

        return {
          position: newPosition,
          velocity: newVelocity,
          time: prev.time + 0.02
        }
      })

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  const theoreticalAcc = ((params.mass * 9.8 * Math.sin((params.angle * Math.PI) / 180) - 
    params.mass * 9.8 * Math.cos((params.angle * Math.PI) / 180) * params.friction - 
    params.force * Math.cos((params.angle * Math.PI) / 180)) / params.mass).toFixed(2)

  return (
    <div className="mechanics-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">时间</span>
            <span className="data-value">{state.time.toFixed(2)}s</span>
          </div>
          <div className="data-item">
            <span className="data-label">速度</span>
            <span className="data-value">{state.velocity.toFixed(2)}m/s</span>
          </div>
          <div className="data-item highlight">
            <span className="data-label">加速度</span>
            <span className="data-value">{theoreticalAcc}m/s²</span>
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
                min="1"
                max="20"
                value={params.mass}
                onChange={(e) => handleParamChange('mass', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">拉力 F: {params.force}N</span>
              <input
                type="range"
                min="0"
                max="50"
                value={params.force}
                onChange={(e) => handleParamChange('force', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">角度 θ: {params.angle}°</span>
              <input
                type="range"
                min="0"
                max="60"
                value={params.angle}
                onChange={(e) => handleParamChange('angle', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">摩擦系数 μ: {params.friction}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.friction}
                onChange={(e) => handleParamChange('friction', e.target.value)}
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
        <h4>⚙️ 力学公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">F = ma</span>
            <span className="formula-desc">牛顿第二定律</span>
          </div>
          <div className="formula-item">
            <span className="formula">G = mg</span>
            <span className="formula-desc">重力</span>
          </div>
          <div className="formula-item">
            <span className="formula">f = μN</span>
            <span className="formula-desc">摩擦力</span>
          </div>
          <div className="formula-item">
            <span className="formula">a = (F合)/m</span>
            <span className="formula-desc">加速度</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicsAnimation