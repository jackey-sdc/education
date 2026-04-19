import React, { useRef, useEffect, useState } from 'react'
import './QuadraticFunctionAnimation.css'

const QuadraticFunctionAnimation = ({ a: initA = 1, b: initB = -2, c: initC = 3 }) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    a: initA,
    b: initB,
    c: initC
  })
  const [showVertex, setShowVertex] = useState(true)
  const [showZeros, setShowZeros] = useState(true)
  const [showAxis, setShowAxis] = useState(true)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const scale = zoom / 100
    const width = Math.floor(600 * scale)
    const height = Math.floor(400 * scale)
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const gridScale = 25 * scale

    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.fillStyle = '#9CA3AF'
    ctx.font = `${Math.max(10, 12 * scale)}px Inter`

    // X轴
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()

    // Y轴
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()

    // X轴刻度
    for (let x = -10; x <= 10; x++) {
      const screenX = centerX + x * gridScale
      ctx.beginPath()
      ctx.moveTo(screenX, centerY - 5 * scale)
      ctx.lineTo(screenX, centerY + 5 * scale)
      ctx.stroke()
      ctx.fillText(x.toString(), screenX - 5, centerY + 18 * scale)
    }

    // Y轴刻度
    for (let y = -10; y <= 10; y++) {
      const screenY = centerY - y * gridScale
      ctx.beginPath()
      ctx.moveTo(centerX - 5 * scale, screenY)
      ctx.lineTo(centerX + 5 * scale, screenY)
      ctx.stroke()
      if (y !== 0) {
        ctx.fillText(y.toString(), centerX + 8 * scale, screenY + 4)
      }
    }

    // 抛物线
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = Math.max(2, 3 * scale)
    ctx.beginPath()

    const { a, b, c } = params
    if (a === 0) return

    const vertexX = -b / (2 * a)
    const vertexY = a * vertexX * vertexX + b * vertexX + c

    let started = false
    for (let screenX = 0; screenX <= width; screenX++) {
      const x = (screenX - centerX) / gridScale
      const y = a * x * x + b * x + c
      const screenY = centerY - y * gridScale

      if (screenY >= -500 && screenY <= height + 500) {
        if (!started) {
          ctx.moveTo(screenX, screenY)
          started = true
        } else {
          ctx.lineTo(screenX, screenY)
        }
      }
    }
    ctx.stroke()

    // 顶点
    if (showVertex) {
      const vx = centerX + vertexX * gridScale
      const vy = centerY - vertexY * gridScale

      ctx.fillStyle = '#F59E0B'
      ctx.beginPath()
      ctx.arc(vx, vy, Math.max(6, 8 * scale), 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = `${Math.max(10, 14 * scale)}px Inter`
      ctx.fillText(`顶点(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, vx + 12 * scale, vy + 5)
    }

    // 零点
    if (showZeros) {
      const discriminant = b * b - 4 * a * c
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)

        const sx1 = centerX + x1 * gridScale
        const sy1 = centerY
        ctx.fillStyle = '#10B981'
        ctx.beginPath()
        ctx.arc(sx1, sy1, Math.max(4, 6 * scale), 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(`x₁=${x1.toFixed(2)}`, sx1 - 18 * scale, sy1 + 18 * scale)

        if (discriminant > 0) {
          const sx2 = centerX + x2 * gridScale
          const sy2 = centerY
          ctx.fillStyle = '#10B981'
          ctx.beginPath()
          ctx.arc(sx2, sy2, Math.max(4, 6 * scale), 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(`x₂=${x2.toFixed(2)}`, sx2 + 8 * scale, sy2 + 18 * scale)
        }
      }
    }

    // 对称轴
    if (showAxis) {
      const axisX = -b / (2 * a)
      const sx = centerX + axisX * gridScale
      ctx.strokeStyle = '#F59E0B'
      ctx.setLineDash([5 * scale, 5 * scale])
      ctx.lineWidth = Math.max(1, 2 * scale)
      ctx.beginPath()
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, height)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 纵截距
    ctx.fillStyle = '#6366F1'
    ctx.font = `bold ${Math.max(10, 16 * scale)}px Inter`
    const yIntercept = c
    const yi = centerY - yIntercept * gridScale
    ctx.beginPath()
    ctx.arc(centerX, yi, Math.max(4, 6 * scale), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`(0, ${c})`, centerX + 8 * scale, yi + 5)
  }, [params, showVertex, showZeros, showAxis, zoom])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas || params.a === 0) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX - canvas.width / 2
    const y = -(e.clientY - rect.top) * scaleY + canvas.height / 2

    const gridScale = 25 * zoom / 100
    const { a, b, c } = params
    const discriminant = b * b - 4 * a * (c - y / gridScale - b * x / (gridScale * a) - a * x * x / (gridScale * gridScale))

    if (discriminant >= 0) {
      const newA = a
      const newB = b + 2 * a * x / gridScale
      const newC = c - y / gridScale - b * x / gridScale - a * x * x / (gridScale * gridScale)

      setParams({ a: newA, b: newB, c: newC })
    }
  }

  const { a, b, c } = params

  const vertexX = a !== 0 ? (-b / (2 * a)).toFixed(2) : 'N/A'
  const vertexY = a !== 0 ? (a * Math.pow(-b / (2 * a), 2) + b * (-b / (2 * a)) + c).toFixed(2) : 'N/A'
  const discriminant = a !== 0 ? (b * b - 4 * a * c).toFixed(2) : 'N/A'

  return (
    <div className="quadratic-animation">
      {/* 左侧：画布区域 */}
      <div className="quadratic-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="animation-canvas"
          onClick={handleCanvasClick}
        />
      </div>

      {/* 右侧：控制面板 */}
      <div className="quadratic-control-panel">
        <div className="info-card">
          <div className="info-row">
            <span className="info-icon vertex-icon"></span>
            <span className="info-label">顶点</span>
            <span className="info-value">({vertexX}, {vertexY})</span>
          </div>
          <div className="info-row">
            <span className="info-icon delta-icon"></span>
            <span className="info-label">判别式</span>
            <span className="info-value">Δ = {discriminant}</span>
          </div>
        </div>

        <div className="params-card">
          <div className="param-item">
            <label className="param-label">
              <span className="param-name">a</span>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={a}
                onChange={(e) => handleParamChange('a', e.target.value)}
                className="param-slider"
              />
              <span className="param-value">{a.toFixed(1)}</span>
            </label>
          </div>
          <div className="param-item">
            <label className="param-label">
              <span className="param-name">b</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={b}
                onChange={(e) => handleParamChange('b', e.target.value)}
                className="param-slider"
              />
              <span className="param-value">{b.toFixed(1)}</span>
            </label>
          </div>
          <div className="param-item">
            <label className="param-label">
              <span className="param-name">c</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={c}
                onChange={(e) => handleParamChange('c', e.target.value)}
                className="param-slider"
              />
              <span className="param-value">{c.toFixed(1)}</span>
            </label>
          </div>
          <div className="param-item">
            <label className="param-label">
              <span className="param-name">缩放</span>
              <input
                type="range"
                min="50"
                max="150"
                step="10"
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{zoom}%</span>
            </label>
          </div>
        </div>

        <div className="display-card">
          <span className="display-title">显示元素</span>
          <div className="display-options">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showVertex}
                onChange={(e) => setShowVertex(e.target.checked)}
              />
              <span className="toggle-label">顶点</span>
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showZeros}
                onChange={(e) => setShowZeros(e.target.checked)}
              />
              <span className="toggle-label">零点</span>
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showAxis}
                onChange={(e) => setShowAxis(e.target.checked)}
              />
              <span className="toggle-label">对称轴</span>
            </label>
          </div>
        </div>

        <div className="hint-card">
          <span className="hint-icon">💡</span>
          <span className="hint-text">点击画布设置函数经过该点</span>
        </div>
      </div>
    </div>
  )
}

export default QuadraticFunctionAnimation
