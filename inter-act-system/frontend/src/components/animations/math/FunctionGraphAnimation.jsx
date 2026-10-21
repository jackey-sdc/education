import React, { useRef, useEffect, useState } from 'react'
import './FunctionGraphAnimation.css'

const FunctionGraphAnimation = ({ problemData }) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({})
  const [showVertex, setShowVertex] = useState(true)
  const [showZeros, setShowZeros] = useState(true)
  const [showAxis, setShowAxis] = useState(true)

  const { functionType, knowledgePoints, initialParams } = problemData || {}

  useEffect(() => {
    if (initialParams) {
      setParams(initialParams)
    }
  }, [initialParams])

  useEffect(() => {
    drawGraph()
  }, [params, functionType, showVertex, showZeros, showAxis])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const scale = 30

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.fillStyle = '#9CA3AF'
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()

    for (let x = -10; x <= 10; x++) {
      const screenX = centerX + x * scale
      ctx.beginPath()
      ctx.moveTo(screenX, centerY - 5)
      ctx.lineTo(screenX, centerY + 5)
      ctx.stroke()
      ctx.fillText(x.toString(), screenX - 5, centerY + 20)
    }

    for (let y = -10; y <= 10; y++) {
      const screenY = centerY - y * scale
      ctx.beginPath()
      ctx.moveTo(centerX - 5, screenY)
      ctx.lineTo(centerX + 5, screenY)
      ctx.stroke()
      if (y !== 0) {
        ctx.fillText(y.toString(), centerX + 10, screenY + 4)
      }
    }

    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 3
    ctx.beginPath()

    let started = false

    for (let screenX = 0; screenX <= width; screenX++) {
      const x = (screenX - centerX) / scale
      let y = 0

      try {
        y = evaluateFunction(x, params, functionType)
        const screenY = centerY - y * scale

        if (screenY >= -500 && screenY <= height + 500) {
          if (!started) {
            ctx.moveTo(screenX, screenY)
            started = true
          } else {
            ctx.lineTo(screenX, screenY)
          }
        }
      } catch (e) {
        started = false
        continue
      }
    }
    ctx.stroke()

    drawMarkers(ctx, centerX, centerY, scale)
  }

  const evaluateFunction = (x, p, type) => {
    switch (type) {
      case 'linear':
        return p.a * x + p.b
      case 'quadratic':
        return p.a * x * x + p.b * x + p.c
      case 'cubic':
        return p.a * x * x * x + p.b * x * x + p.c * x + p.d
      case 'trigonometric':
        if (p.type === 'sin') return p.a * Math.sin(p.b * x + p.c) + p.d
        if (p.type === 'cos') return p.a * Math.cos(p.b * x + p.c) + p.d
        return 0
      case 'exponential':
        return p.a * Math.pow(p.b, x) + p.c
      default:
        return 0
    }
  }

  const drawMarkers = (ctx, centerX, centerY, scale) => {
    if (showZeros && functionType === 'quadratic') {
      const { a, b, c } = params
      const discriminant = b * b - 4 * a * c
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
        ctx.fillStyle = '#10B981'
        ctx.beginPath()
        ctx.arc(centerX + x1 * scale, centerY, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(`x₁=${x1.toFixed(2)}`, centerX + x1 * scale - 20, centerY + 20)
        if (discriminant > 0) {
          ctx.beginPath()
          ctx.arc(centerX + x2 * scale, centerY, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillText(`x₂=${x2.toFixed(2)}`, centerX + x2 * scale + 10, centerY + 20)
        }
      }
    }

    if (showVertex && functionType === 'quadratic') {
      const { a, b, c } = params
      const vx = -b / (2 * a)
      const vy = a * vx * vx + b * vx + c
      ctx.fillStyle = '#F59E0B'
      ctx.beginPath()
      ctx.arc(centerX + vx * scale, centerY - vy * scale, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(`顶点(${vx.toFixed(2)}, ${vy.toFixed(2)})`, centerX + vx * scale + 15, centerY - vy * scale + 5)
    }

    if (showAxis && functionType === 'quadratic') {
      const { a, b } = params
      const axisX = -b / (2 * a)
      ctx.strokeStyle = '#F59E0B'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(centerX + axisX * scale, 0)
      ctx.lineTo(centerX + axisX * scale, canvasRef.current.height)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  const renderControls = () => {
    switch (functionType) {
      case 'linear':
        return (
          <>
            <div className="control-group">
              <label>
                <span className="control-label">斜率 k</span>
                <input type="range" min="-5" max="5" step="0.1" value={params.a || 1} onChange={(e) => handleParamChange('a', e.target.value)} />
                <span className="control-value">{(params.a || 1).toFixed(1)}</span>
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">截距 b</span>
                <input type="range" min="-10" max="10" step="0.1" value={params.b || 0} onChange={(e) => handleParamChange('b', e.target.value)} />
                <span className="control-value">{(params.b || 0).toFixed(1)}</span>
              </label>
            </div>
          </>
        )
      case 'quadratic':
        return (
          <>
            <div className="control-group">
              <label>
                <span className="control-label">a (开口)</span>
                <input type="range" min="-3" max="3" step="0.1" value={params.a || 1} onChange={(e) => handleParamChange('a', e.target.value)} />
                <span className="control-value">{(params.a || 1).toFixed(1)}</span>
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">b (平移)</span>
                <input type="range" min="-10" max="10" step="0.1" value={params.b || 0} onChange={(e) => handleParamChange('b', e.target.value)} />
                <span className="control-value">{(params.b || 0).toFixed(1)}</span>
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">c (上下)</span>
                <input type="range" min="-10" max="10" step="0.1" value={params.c || 0} onChange={(e) => handleParamChange('c', e.target.value)} />
                <span className="control-value">{(params.c || 0).toFixed(1)}</span>
              </label>
            </div>
          </>
        )
      case 'trigonometric':
        return (
          <>
            <div className="control-group">
              <label>
                <span className="control-label">振幅 a</span>
                <input type="range" min="1" max="5" step="0.1" value={params.a || 1} onChange={(e) => handleParamChange('a', e.target.value)} />
                <span className="control-value">{(params.a || 1).toFixed(1)}</span>
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">频率 b</span>
                <input type="range" min="1" max="5" step="0.1" value={params.b || 1} onChange={(e) => handleParamChange('b', e.target.value)} />
                <span className="control-value">{(params.b || 1).toFixed(1)}</span>
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">相位 c</span>
                <input type="range" min="0" max="6.28" step="0.1" value={params.c || 0} onChange={(e) => handleParamChange('c', e.target.value)} />
                <span className="control-value">{(params.c || 0).toFixed(1)}</span>
              </label>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const getFunctionString = () => {
    switch (functionType) {
      case 'linear':
        return `f(x) = ${params.a || 1}x + ${params.b || 0}`
      case 'quadratic':
        return `f(x) = ${params.a || 1}x² + ${params.b || 0}x + ${params.c || 0}`
      case 'cubic':
        return `f(x) = ${params.a || 1}x³ + ...`
      case 'trigonometric':
        return `f(x) = ${params.a || 1}·${params.type || 'sin'}(${params.b || 1}x + ${params.c || 0})`
      default:
        return 'f(x) = ...'
    }
  }

  return (
    <div className="function-graph-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-info">
        <div className="info-item">
          <span className="info-label">函数:</span>
          <span className="info-value">{getFunctionString()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">类型:</span>
          <span className="info-value">{knowledgePoints?.join(', ') || '函数'}</span>
        </div>
      </div>

      <div className="animation-controls">
        {renderControls()}
      </div>

      <div className="animation-toggles">
        <label className="toggle-item">
          <input type="checkbox" checked={showVertex} onChange={(e) => setShowVertex(e.target.checked)} />
          <span>显示顶点</span>
        </label>
        <label className="toggle-item">
          <input type="checkbox" checked={showZeros} onChange={(e) => setShowZeros(e.target.checked)} />
          <span>显示零点</span>
        </label>
        <label className="toggle-item">
          <input type="checkbox" checked={showAxis} onChange={(e) => setShowAxis(e.target.checked)} />
          <span>显示对称轴</span>
        </label>
      </div>

      <div className="animation-hint">
        <p>💡 拖动滑块调整函数参数，观察图像变化</p>
      </div>
    </div>
  )
}

export default FunctionGraphAnimation
