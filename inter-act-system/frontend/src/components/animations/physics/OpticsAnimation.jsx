import React, { useRef, useEffect, useState } from 'react'
import './OpticsAnimation.css'

const OpticsAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    objectDistance: 60,
    focalLength: 30,
    objectHeight: 20,
    mirrorType: 'concave'
  })
  const [rayOffset, setRayOffset] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 350
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { objectDistance, focalLength, objectHeight, mirrorType } = params

    // 光学系统中心
    const centerX = width / 2
    const centerY = height / 2
    const axisY = centerY + 50

    // 绘制坐标轴
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, axisY)
    ctx.lineTo(width, axisY)
    ctx.stroke()
    ctx.setLineDash([])

    // 主光轴标注
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px Inter'
    ctx.fillText('主光轴', width - 50, axisY - 8)

    // 绘制镜子
    const mirrorX = centerX
    const mirrorLength = 200
    const curvature = mirrorType === 'concave' ? -0.02 : 0.02

    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(mirrorX, centerY - mirrorLength / 2)
    for (let y = -mirrorLength / 2; y <= mirrorLength / 2; y += 5) {
      const x = mirrorX + curvature * y * y
      ctx.lineTo(x, centerY + y)
    }
    ctx.stroke()

    // 镜子顶点
    ctx.fillStyle = '#3B82F6'
    ctx.beginPath()
    ctx.arc(mirrorX, centerY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 焦点标注
    const focusX = mirrorType === 'concave' ? mirrorX - focalLength : mirrorX + focalLength
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(focusX, axisY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#EF4444'
    ctx.font = '10px Inter'
    ctx.fillText('F', focusX - 3, axisY + 15)

    // 曲率中心
    const centerOfCurvature = mirrorType === 'concave' ? mirrorX - 2 * focalLength : mirrorX + 2 * focalLength
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(centerOfCurvature, axisY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#10B981'
    ctx.fillText('C', centerOfCurvature - 3, axisY + 15)

    // 物距和像距
    const objectX = mirrorX - objectDistance
    const objectY = axisY - objectHeight

    // 绘制物体（箭头）
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(objectX, axisY)
    ctx.lineTo(objectX, objectY)
    ctx.stroke()
    ctx.fillStyle = '#F59E0B'
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(objectX - 5, objectY + 10)
    ctx.lineTo(objectX + 5, objectY + 10)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#F59E0B'
    ctx.font = '10px Inter'
    ctx.fillText('物体', objectX - 5, axisY + 15)

    // 计算像的位置
    const doVal = objectDistance
    const fVal = focalLength
    const hoVal = objectHeight

    // 透镜公式: 1/f = 1/u + 1/v
    // 对于镜子: 1/f = 1/u + 1/v (实像为正，虚像为负)
    let imageDistance, imageHeight, isReal, isInverted

    if (mirrorType === 'concave') {
      // 凹面镜
      if (doVal > 2 * fVal) {
        // 物体在曲率中心外，成倒立实像
        imageDistance = 1 / (1 / fVal - 1 / doVal)
        isReal = true
        isInverted = true
      } else if (doVal > fVal) {
        // 物体在曲率中心和焦点之间，成倒立放大实像
        imageDistance = 1 / (1 / fVal - 1 / doVal)
        isReal = true
        isInverted = true
      } else {
        // 物体在焦点内，成正立虚像
        imageDistance = 1 / (1 / fVal - 1 / doVal)
        isReal = false
        isInverted = false
      }
    } else {
      // 凸面镜只能成正立虚像
      imageDistance = 1 / (1 / (-fVal) - 1 / doVal)
      isReal = false
      isInverted = false
    }

    imageHeight = hoVal * (Math.abs(imageDistance) / doVal) * (isInverted ? -1 : 1)

    const imageX = mirrorX + imageDistance
    const imageY = axisY + imageHeight

    // 绘制光线
    const rayAnimOffset = rayOffset / 50

    // 光线1: 通过球心
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(centerOfCurvature, axisY)
    ctx.lineTo(imageX, axisY)
    ctx.stroke()

    // 光线2: 平行于主光轴，经焦点反射
    const reflectedX = mirrorX + fVal * 2
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(mirrorX + (reflectedX - mirrorX) * rayAnimOffset, objectY + (axisY - objectY) * rayAnimOffset)
    ctx.stroke()

    // 光线3: 通过焦点的光线
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(focusX, axisY)
    ctx.stroke()

    // 绘制像
    if (isReal) {
      ctx.strokeStyle = '#EC4899'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(imageX, axisY)
      ctx.lineTo(imageX, imageY)
      ctx.stroke()
      ctx.fillStyle = '#EC4899'
      ctx.beginPath()
      ctx.moveTo(imageX, imageY)
      ctx.lineTo(imageX - 5, imageY + 10 * Math.sign(imageHeight))
      ctx.lineTo(imageX + 5, imageY + 10 * Math.sign(imageHeight))
      ctx.closePath()
      ctx.fill()
    } else {
      // 虚像用虚线
      ctx.strokeStyle = '#EC4899'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(imageX, axisY)
      ctx.lineTo(imageX, imageY)
      ctx.stroke()
      ctx.setLineDash([])

      // 虚像扩展线
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)'
      ctx.beginPath()
      ctx.moveTo(imageX, axisY)
      ctx.lineTo(mirrorX, imageY)
      ctx.stroke()
    }

    ctx.fillStyle = '#EC4899'
    ctx.font = '10px Inter'
    ctx.fillText(isReal ? '实像' : '虚像', imageX - 5, axisY + 15)

    // 数据面板
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(20, 20, 130, 100)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(20, 20, 130, 100)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 11px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('光学参数', 30, 38)
    ctx.font = '10px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`物距 u = ${doVal}cm`, 30, 56)
    ctx.fillText(`像距 v = ${imageDistance.toFixed(1)}cm`, 30, 72)
    ctx.fillText(`物高 h = ${hoVal}cm`, 30, 88)
    ctx.fillStyle = '#EC4899'
    ctx.fillText(`像高 h' = ${Math.abs(imageHeight).toFixed(1)}cm`, 30, 104)

    // 公式
    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 11px Inter'
    ctx.fillText('1/u + 1/v = 1/f', 30, 280)
    ctx.fillText(`放大率 m = |v/u| = ${Math.abs(imageDistance / doVal).toFixed(2)}`, 30, 300)

  }, [params, rayOffset])

  useEffect(() => {
    const interval = setInterval(() => {
      setRayOffset(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  return (
    <div className="optics-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">镜子类型</span>
              <select
                value={params.mirrorType}
                onChange={(e) => setParams(prev => ({ ...prev, mirrorType: e.target.value }))}
                className="control-select"
              >
                <option value="concave">凹面镜</option>
                <option value="convex">凸面镜</option>
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">物距 u: {params.objectDistance}cm</span>
              <input
                type="range"
                min="10"
                max="150"
                value={params.objectDistance}
                onChange={(e) => handleParamChange('objectDistance', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">焦距 f: {params.focalLength}cm</span>
              <input
                type="range"
                min="10"
                max="80"
                value={params.focalLength}
                onChange={(e) => handleParamChange('focalLength', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">物高 h: {params.objectHeight}cm</span>
              <input
                type="range"
                min="5"
                max="40"
                value={params.objectHeight}
                onChange={(e) => handleParamChange('objectHeight', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-formula">
        <h4>🔍 光学公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">1/u + 1/v = 1/f</span>
            <span className="formula-desc">球面镜成像</span>
          </div>
          <div className="formula-item">
            <span className="formula">m = |v/u|</span>
            <span className="formula-desc">放大率</span>
          </div>
          <div className="formula-item">
            <span className="formula">m = h'/h</span>
            <span className="formula-desc">像高/物高</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpticsAnimation