import React, { useRef, useEffect, useState } from 'react'
import './GeometryAnimation.css'

const GeometryAnimation = ({ type: initType = 'triangle' }) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    base: 100,
    height: 80,
    radius: 50,
    sideA: 3,
    sideB: 4,
    hypotenuse: 5
  })
  const [shapeType, setShapeType] = useState(initType)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [showArea, setShowArea] = useState(true)

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
      const gridSize = 20 * scale

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

    const drawTriangle = () => {
      const { base, height: h } = params
      const scaledBase = base * scale
      const scaledHeight = h * scale

      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
      ctx.strokeStyle = '#6366F1'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(centerX - scaledBase / 2, centerY + scaledHeight / 2)
      ctx.lineTo(centerX + scaledBase / 2, centerY + scaledHeight / 2)
      ctx.lineTo(centerX, centerY - scaledHeight / 2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 底边
      ctx.fillStyle = '#10B981'
      ctx.font = `${12 * scale}px Inter`
      ctx.textAlign = 'center'
      ctx.fillText(`b=${base}`, centerX, centerY + scaledHeight / 2 + 20 * scale)

      // 高
      ctx.strokeStyle = '#F59E0B'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(centerX, centerY + scaledHeight / 2)
      ctx.lineTo(centerX, centerY - scaledHeight / 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#F59E0B'
      ctx.fillText(`h=${h}`, centerX + 30 * scale, centerY)

      // 面积
      if (showArea) {
        const area = 0.5 * base * h
        ctx.fillStyle = '#EC4899'
        ctx.font = `bold ${14 * scale}px Inter`
        ctx.fillText(`S = ½ × ${base} × ${h} = ${area}`, centerX, centerY + 10 * scale)
      }
    }

    const drawRectangle = () => {
      const { base, height: h } = params
      const scaledBase = base * scale * 1.5
      const scaledHeight = h * scale * 1.5

      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 2

      ctx.fillRect(centerX - scaledBase / 2, centerY - scaledHeight / 2, scaledBase, scaledHeight)
      ctx.strokeRect(centerX - scaledBase / 2, centerY - scaledHeight / 2, scaledBase, scaledHeight)

      ctx.fillStyle = '#10B981'
      ctx.font = `${12 * scale}px Inter`
      ctx.textAlign = 'center'
      ctx.fillText(`长=${base}`, centerX, centerY + scaledHeight / 2 + 20 * scale)
      ctx.fillText(`宽=${h}`, centerX + scaledBase / 2 + 25 * scale, centerY)

      if (showArea) {
        const area = base * h
        ctx.fillStyle = '#EC4899'
        ctx.font = `bold ${14 * scale}px Inter`
        ctx.fillText(`S = ${base} × ${h} = ${area}`, centerX, centerY)
      }
    }

    const drawCircle = () => {
      const { radius } = params
      const scaledRadius = radius * scale

      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(centerX, centerY, scaledRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // 半径线
      ctx.strokeStyle = '#6366F1'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + scaledRadius, centerY)
      ctx.stroke()

      ctx.fillStyle = '#6366F1'
      ctx.font = `${12 * scale}px Inter`
      ctx.textAlign = 'center'
      ctx.fillText(`r=${radius}`, centerX + scaledRadius / 2, centerY - 10 * scale)

      // 直径
      ctx.fillStyle = '#10B981'
      ctx.font = `${12 * scale}px Inter`
      ctx.fillText(`d=${2 * radius}`, centerX, centerY + scaledRadius + 25 * scale)

      if (showArea) {
        const area = Math.PI * radius * radius
        const circumference = 2 * Math.PI * radius
        ctx.fillStyle = '#EC4899'
        ctx.font = `bold ${14 * scale}px Inter`
        ctx.fillText(`S = π × ${radius}² = ${area.toFixed(2)}`, centerX, centerY - scaledRadius - 15 * scale)
        ctx.font = `${12 * scale}px Inter`
        ctx.fillText(`C = 2πr = ${circumference.toFixed(2)}`, centerX, centerY + scaledRadius + 40 * scale)
      }
    }

    const drawPythagorean = () => {
      const { sideA, sideB } = params
      const scaledA = sideA * scale * 30
      const scaledB = sideB * scale * 30
      const scaledC = Math.sqrt(sideA * sideA + sideB * sideB) * scale * 30

      // 直角三角形
      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
      ctx.strokeStyle = '#6366F1'
      ctx.lineWidth = 2

      const startX = centerX - 100 * scale
      const startY = centerY + 80 * scale

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + scaledA, startY)
      ctx.lineTo(startX, startY - scaledB)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 边长标注
      ctx.fillStyle = '#10B981'
      ctx.font = `${12 * scale}px Inter`
      ctx.textAlign = 'center'
      ctx.fillText(`a=${sideA}`, startX + scaledA / 2, startY + 20 * scale)

      ctx.fillStyle = '#F59E0B'
      ctx.fillText(`b=${sideB}`, startX - 20 * scale, startY - scaledB / 2)

      ctx.fillStyle = '#EC4899'
      ctx.font = `bold ${14 * scale}px Inter`
      ctx.fillText(`c=${scaledC.toFixed(1)}`, startX + scaledA / 2 - 30 * scale, startY - scaledB / 2 + 10 * scale)

      // 勾股定理公式
      const cSquared = sideA * sideA + sideB * sideB
      ctx.fillStyle = '#8B5CF6'
      ctx.font = `bold ${16 * scale}px Inter`
      ctx.fillText(`${sideA}² + ${sideB}² = ${sideA * sideA} + ${sideB * sideB} = ${cSquared}`, centerX, centerY + 120 * scale)
      ctx.fillText(`c = √${cSquared} = ${Math.sqrt(cSquared).toFixed(2)}`, centerX, centerY + 145 * scale)
    }

    switch (shapeType) {
      case 'triangle':
        drawTriangle()
        break
      case 'rectangle':
        drawRectangle()
        break
      case 'circle':
        drawCircle()
        break
      case 'pythagorean':
        drawPythagorean()
        break
      default:
        drawTriangle()
    }
  }, [params, shapeType, zoom, showGrid, showArea])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  return (
    <div className="geometry-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">图形类型</span>
              <select
                value={shapeType}
                onChange={(e) => setShapeType(e.target.value)}
                className="control-select"
              >
                <option value="triangle">三角形</option>
                <option value="rectangle">矩形</option>
                <option value="circle">圆形</option>
                <option value="pythagorean">勾股定理</option>
              </select>
            </label>
          </div>
        </div>

        {(shapeType === 'triangle' || shapeType === 'rectangle') && (
          <div className="control-row">
            <div className="control-group">
              <label>
                <span className="control-label">底/长: {params.base}</span>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={params.base}
                  onChange={(e) => handleParamChange('base', e.target.value)}
                />
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">高/宽: {params.height}</span>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={params.height}
                  onChange={(e) => handleParamChange('height', e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {shapeType === 'circle' && (
          <div className="control-row">
            <div className="control-group">
              <label>
                <span className="control-label">半径: {params.radius}</span>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={params.radius}
                  onChange={(e) => handleParamChange('radius', e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {shapeType === 'pythagorean' && (
          <div className="control-row">
            <div className="control-group">
              <label>
                <span className="control-label">直角边a: {params.sideA}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={params.sideA}
                  onChange={(e) => handleParamChange('sideA', e.target.value)}
                />
              </label>
            </div>
            <div className="control-group">
              <label>
                <span className="control-label">直角边b: {params.sideB}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={params.sideB}
                  onChange={(e) => handleParamChange('sideB', e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

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
              checked={showArea}
              onChange={(e) => setShowArea(e.target.checked)}
            />
            显示面积公式
          </label>
        </div>
      </div>

      <div className="animation-formula">
        <h4>📐 几何公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">S△ = ½bh</span>
            <span className="formula-desc">三角形面积</span>
          </div>
          <div className="formula-item">
            <span className="formula">S□ = ab</span>
            <span className="formula-desc">矩形面积</span>
          </div>
          <div className="formula-item">
            <span className="formula">S○ = πr²</span>
            <span className="formula-desc">圆面积</span>
          </div>
          <div className="formula-item">
            <span className="formula">c² = a² + b²</span>
            <span className="formula-desc">勾股定理</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeometryAnimation