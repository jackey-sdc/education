import React, { useRef, useEffect, useState } from 'react'
import './VectorAnimation.css'

const VectorAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    vecAX: 80,
    vecAY: 30,
    vecBX: 40,
    vecBY: 70
  })
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [showComponents, setShowComponents] = useState(true)
  const [operation, setOperation] = useState('none')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const scale = zoom / 100
    const width = Math.floor(500 * scale)
    const height = Math.floor(400 * scale)
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2

    // 网格背景
    if (showGrid) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      const gridSize = 25 * scale

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    // 坐标系
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()

    ctx.fillStyle = '#9CA3AF'
    ctx.font = `${12 * scale}px Inter`
    ctx.fillText('x', width - 15, centerY - 10)
    ctx.fillText('y', centerX + 10, 15)

    const drawArrow = (fromX, fromY, toX, toY, color, label, showComp = false) => {
      const headLen = 12 * scale
      const angle = Math.atan2(toY - fromY, toX - fromX)

      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 3 * scale

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()

      if (label) {
        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2
        ctx.font = `bold ${14 * scale}px Inter`
        ctx.textAlign = 'center'
        ctx.fillText(label, midX, midY - 10 * scale)
      }
    }

    const { vecAX, vecAY, vecBX, vecBY } = params
    const scaleVec = 2 * scale

    const aEndX = centerX + vecAX * scaleVec
    const aEndY = centerY - vecAY * scaleVec
    const bEndX = centerX + vecBX * scaleVec
    const bEndY = centerY - vecBY * scaleVec

    // 向量A (红色)
    drawArrow(centerX, centerY, aEndX, aEndY, '#EF4444', `A(${vecAX}, ${vecAY})`)
    
    // 向量B (蓝色)
    drawArrow(centerX, centerY, bEndX, bEndY, '#3B82F6', `B(${vecBX}, ${vecBY})`)

    // 分量显示
    if (showComponents) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      ctx.beginPath()
      ctx.moveTo(aEndX, centerY)
      ctx.lineTo(aEndX, aEndY)
      ctx.moveTo(centerX, aEndY)
      ctx.lineTo(aEndX, aEndY)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.beginPath()
      ctx.moveTo(bEndX, centerY)
      ctx.lineTo(bEndX, bEndY)
      ctx.moveTo(centerX, bEndY)
      ctx.lineTo(bEndX, bEndY)
      ctx.stroke()

      ctx.setLineDash([])
    }

    // 向量运算
    if (operation === 'add') {
      const sumX = vecAX + vecBX
      const sumY = vecAY + vecBY
      const sumEndX = centerX + sumX * scaleVec
      const sumEndY = centerY - sumY * scaleVec
      
      drawArrow(centerX, centerY, sumEndX, sumEndY, '#10B981', `A+B`)
      
      ctx.fillStyle = '#10B981'
      ctx.font = `bold ${14 * scale}px Inter`
      ctx.textAlign = 'left'
      ctx.fillText(`A + B = (${sumX}, ${sumY})`, 20 * scale, 30 * scale)
    } else if (operation === 'sub') {
      const diffAX = vecAX - vecBX
      const diffAY = vecAY - vecBY
      const diffEndX = centerX + diffAX * scaleVec
      const diffEndY = centerY - diffAY * scaleVec
      
      drawArrow(centerX, centerY, diffEndX, diffEndY, '#F59E0B', `A-B`)
      
      ctx.fillStyle = '#F59E0B'
      ctx.font = `bold ${14 * scale}px Inter`
      ctx.textAlign = 'left'
      ctx.fillText(`A - B = (${diffAX}, ${diffAY})`, 20 * scale, 30 * scale)
    } else if (operation === 'dot') {
      const dotProduct = vecAX * vecBX + vecAY * vecBY
      const magA = Math.sqrt(vecAX * vecAX + vecAY * vecAY)
      const magB = Math.sqrt(vecBX * vecBX + vecBY * vecBY)
      const cosAngle = dotProduct / (magA * magB)
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
      
      ctx.fillStyle = '#8B5CF6'
      ctx.font = `bold ${14 * scale}px Inter`
      ctx.textAlign = 'left'
      ctx.fillText(`A · B = ${vecAX}×${vecBX} + ${vecAY}×${vecBY} = ${dotProduct}`, 20 * scale, 30 * scale)
      ctx.font = `${12 * scale}px Inter`
      ctx.fillText(`|A| = ${magA.toFixed(2)}, |B| = ${magB.toFixed(2)}`, 20 * scale, 50 * scale)
      ctx.fillText(`cos θ = ${cosAngle.toFixed(3)}, θ = ${angle.toFixed(1)}°`, 20 * scale, 70 * scale)
    } else if (operation === 'cross') {
      const crossProduct = vecAX * vecBY - vecAY * vecBX
      const magA = Math.sqrt(vecAX * vecAX + vecAY * vecAY)
      const magB = Math.sqrt(vecBX * vecBX + vecBY * vecBY)
      const sinAngle = crossProduct / (magA * magB)
      const angle = Math.asin(Math.max(-1, Math.min(1, sinAngle))) * 180 / Math.PI
      
      ctx.fillStyle = '#EC4899'
      ctx.font = `bold ${14 * scale}px Inter`
      ctx.textAlign = 'left'
      ctx.fillText(`A × B = ${vecAX}×${vecBY} - ${vecAY}×${vecBX} = ${crossProduct}`, 20 * scale, 30 * scale)
      ctx.font = `${12 * scale}px Inter`
      ctx.fillText(`|A| = ${magA.toFixed(2)}, |B| = ${magB.toFixed(2)}`, 20 * scale, 50 * scale)
      ctx.fillText(`sin θ = ${sinAngle.toFixed(3)}, θ = ${angle.toFixed(1)}°`, 20 * scale, 70 * scale)
    }
  }, [params, zoom, showGrid, showComponents, operation])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  return (
    <div className="vector-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">向量A X: {params.vecAX}</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.vecAX}
                onChange={(e) => handleParamChange('vecAX', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">向量A Y: {params.vecAY}</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.vecAY}
                onChange={(e) => handleParamChange('vecAY', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">向量B X: {params.vecBX}</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.vecBX}
                onChange={(e) => handleParamChange('vecBX', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">向量B Y: {params.vecBY}</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.vecBY}
                onChange={(e) => handleParamChange('vecBY', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">缩放: {zoom}%</span>
              <input
                type="range"
                min="50"
                max="150"
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">运算</span>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="control-select"
              >
                <option value="none">无</option>
                <option value="add">加法 A + B</option>
                <option value="sub">减法 A - B</option>
                <option value="dot">点积 A · B</option>
                <option value="cross">叉积 A × B</option>
              </select>
            </label>
          </div>
        </div>

        <div className="control-row checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            显示网格
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showComponents}
              onChange={(e) => setShowComponents(e.target.checked)}
            />
            显示分量
          </label>
        </div>
      </div>

      <div className="animation-formula">
        <h4>📐 向量公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">A + B</span>
            <span className="formula-desc">向量加法</span>
          </div>
          <div className="formula-item">
            <span className="formula">A - B</span>
            <span className="formula-desc">向量减法</span>
          </div>
          <div className="formula-item">
            <span className="formula">A · B</span>
            <span className="formula-desc">点积/数量积</span>
          </div>
          <div className="formula-item">
            <span className="formula">A × B</span>
            <span className="formula-desc">叉积/矢量积</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VectorAnimation