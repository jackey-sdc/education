import React, { useRef, useEffect, useState } from 'react'
import './SoundWaveAnimation.css'

const SoundWaveAnimation = ({}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [params, setParams] = useState({
    frequency: 440,
    amplitude: 50,
    waveType: 'sine',
    speed: 1
  })
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const { frequency, amplitude, waveType, speed } = params
    const centerY = height / 2

    // 绘制背景网格
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 1
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 中心线
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()

    // 波长和周期
    const wavelength = (speed * 200) / frequency
    const period = 1 / frequency

    // 绘制波形
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 3
    ctx.beginPath()

    for (let x = 0; x < width; x++) {
      const t = (x / width) * 4 + phase
      let y = 0

      switch (waveType) {
        case 'sine':
          y = amplitude * Math.sin(2 * Math.PI * frequency * t / speed)
          break
        case 'square':
          y = amplitude * (Math.sin(2 * Math.PI * frequency * t / speed) > 0 ? 1 : -1)
          break
        case 'triangle':
          y = amplitude * (2 * Math.abs(2 * ((frequency * t / speed) % 1) - 1) - 1)
          break
        case 'sawtooth':
          y = amplitude * (2 * ((frequency * t / speed) % 1) - 1)
          break
        default:
          y = amplitude * Math.sin(2 * Math.PI * frequency * t / speed)
      }

      if (x === 0) {
        ctx.moveTo(x, centerY - y)
      } else {
        ctx.lineTo(x, centerY - y)
      }
    }
    ctx.stroke()

    // 绘制声音粒子
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const x = ((i / particleCount + phase / 10) % 1) * width
      const t = (x / width) * 4 + phase
      let y = 0

      switch (waveType) {
        case 'sine':
          y = amplitude * Math.sin(2 * Math.PI * frequency * t / speed)
          break
        case 'square':
          y = amplitude * (Math.sin(2 * Math.PI * frequency * t / speed) > 0 ? 1 : -1)
          break
        default:
          y = amplitude * Math.sin(2 * Math.PI * frequency * t / speed)
      }

      const alpha = 0.3 + 0.7 * (Math.abs(y) / amplitude)
      ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, centerY - y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // 波长标注
    ctx.fillStyle = '#F59E0B'
    ctx.font = '11px Inter'
    ctx.fillText(`λ = ${wavelength.toFixed(1)}m`, width - 80, 25)

    // 频率标注
    ctx.fillStyle = '#10B981'
    ctx.fillText(`f = ${frequency}Hz`, width - 80, 45)

    // 周期标注
    ctx.fillStyle = '#EC4899'
    ctx.fillText(`T = ${(period * 1000).toFixed(1)}ms`, width - 80, 65)

    // 振幅标注
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(width - 60, centerY - amplitude)
    ctx.lineTo(width - 60, centerY + amplitude)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`A = ${amplitude}`, width - 60, centerY + amplitude + 15)

  }, [params, phase])

  useEffect(() => {
    const animate = () => {
      setPhase(prev => prev + 0.02 * params.speed)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [params.speed])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  const wavelength = (params.speed * 200) / params.frequency
  const period = 1000 / params.frequency

  return (
    <div className="sound-wave-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">波长</span>
            <span className="data-value">{wavelength.toFixed(1)}m</span>
          </div>
          <div className="data-item">
            <span className="data-label">频率</span>
            <span className="data-value">{params.frequency}Hz</span>
          </div>
          <div className="data-item">
            <span className="data-label">周期</span>
            <span className="data-value">{period.toFixed(1)}ms</span>
          </div>
        </div>
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">波形类型</span>
              <select
                value={params.waveType}
                onChange={(e) => setParams(prev => ({ ...prev, waveType: e.target.value }))}
                className="control-select"
              >
                <option value="sine">正弦波</option>
                <option value="square">方波</option>
                <option value="triangle">三角波</option>
                <option value="sawtooth">锯齿波</option>
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">频率 f: {params.frequency}Hz</span>
              <input
                type="range"
                min="20"
                max="2000"
                value={params.frequency}
                onChange={(e) => handleParamChange('frequency', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">振幅 A: {params.amplitude}</span>
              <input
                type="range"
                min="10"
                max="100"
                value={params.amplitude}
                onChange={(e) => handleParamChange('amplitude', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">速度: {params.speed}</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={params.speed}
                onChange={(e) => handleParamChange('speed', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-formula">
        <h4>🔊 声波公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">v = λf</span>
            <span className="formula-desc">波速公式</span>
          </div>
          <div className="formula-item">
            <span className="formula">T = 1/f</span>
            <span className="formula-desc">周期</span>
          </div>
          <div className="formula-item">
            <span className="formula">λ = v/f</span>
            <span className="formula-desc">波长</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoundWaveAnimation