import React, { useRef, useEffect, useState } from 'react'
import './MoleAnimation.css'

const MoleAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    substance: 'water',
    mass: 18,
    volume: 18
  })
  const [displayData, setDisplayData] = useState({
    molarMass: 18,
    moleCount: 1,
    particleCount: '6.02 × 10²³',
    volumeAtSTP: 22.4
  })

  const substances = {
    water: { formula: 'H₂O', molarMass: 18, density: 1 },
    oxygen: { formula: 'O₂', molarMass: 32, density: 1.429 },
    carbon: { formula: 'CO₂', molarMass: 44, density: 1.977 },
    nitrogen: { formula: 'N₂', molarMass: 28, density: 1.251 },
    hydrogen: { formula: 'H₂', molarMass: 2, density: 0.0899 },
    methane: { formula: 'CH₄', molarMass: 16, density: 0.716 }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 300
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { substance, mass } = params
    const sub = substances[substance]
    const moleCount = mass / sub.molarMass
    const avogadro = 6.02e23
    const particleCount = moleCount * avogadro

    // 标题
    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 16px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`${substance.toUpperCase()} (${sub.formula})`, width / 2, 25)

    // 绘制分子模型
    const modelCenterX = 120
    const modelCenterY = 130
    const atomRadius = 20

    // 氧原子（红色）
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(modelCenterX, modelCenterY, atomRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#B91C1C'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.fillText('O', modelCenterX, modelCenterY + 4)

    // 氢原子（白色）
    const hAngle1 = -Math.PI / 4
    const hAngle2 = Math.PI + Math.PI / 4
    const bondLength = 35

    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 2

    // H1
    const h1x = modelCenterX + Math.cos(hAngle1) * bondLength
    const h1y = modelCenterY + Math.sin(hAngle1) * bondLength
    ctx.beginPath()
    ctx.arc(h1x, h1y, atomRadius * 0.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 10px Inter'
    ctx.fillText('H', h1x, h1y + 3)

    // H2
    const h2x = modelCenterX + Math.cos(hAngle2) * bondLength
    const h2y = modelCenterY + Math.sin(hAngle2) * bondLength
    ctx.beginPath()
    ctx.arc(h2x, h2y, atomRadius * 0.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#374151'
    ctx.fillText('H', h2x, h2y + 3)

    // 化学键
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(modelCenterX + atomRadius, modelCenterY)
    ctx.lineTo(h1x - atomRadius * 0.7, h1y)
    ctx.moveTo(modelCenterX - atomRadius, modelCenterY)
    ctx.lineTo(h2x + atomRadius * 0.7, h2y)
    ctx.stroke()

    // 分子数量可视化
    const particleBoxX = 250
    const particleBoxY = 50
    const boxWidth = 220
    const boxHeight = 180

    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.strokeRect(particleBoxX, particleBoxY, boxWidth, boxHeight)
    ctx.fillStyle = '#374151'
    ctx.font = '10px Inter'
    ctx.fillText('微观粒子示意', particleBoxX + boxWidth / 2, particleBoxY + boxHeight + 15)

    // 绘制粒子点
    const displayParticles = Math.min(100, Math.floor(moleCount * 10))
    const cols = 10
    const rows = 10
    const spacing = 18
    const startX = particleBoxX + 15
    const startY = particleBoxY + 15

    for (let i = 0; i < displayParticles; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * spacing
      const y = startY + row * spacing

      ctx.fillStyle = substance === 'water' ? '#60A5FA' : '#A78BFA'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    if (moleCount > 1) {
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px Inter'
      ctx.fillText(`× ${moleCount.toFixed(2)} mol`, particleBoxX + boxWidth / 2, particleBoxY + boxHeight / 2)
    }

    // 数据面板
    const dataX = 30
    const dataY = 200

    ctx.fillStyle = '#1E293B'
    ctx.fillRect(dataX, dataY, 200, 90)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(dataX, dataY, 200, 90)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('摩尔计算', dataX + 10, dataY + 20)

    ctx.font = '11px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`物质的量: ${moleCount.toFixed(4)} mol`, dataX + 10, dataY + 42)
    ctx.fillText(`粒子数: ${particleCount.toExponential(2)}`, dataX + 10, dataY + 60)
    ctx.fillStyle = '#10B981'
    ctx.fillText(`摩尔质量: ${sub.molarMass} g/mol`, dataX + 10, dataY + 78)

  }, [params])

  const handleParamChange = (param, value) => {
    if (param === 'substance') {
      const sub = substances[value]
      setParams(prev => ({
        ...prev,
        substance: value,
        mass: sub.molarMass
      }))
    } else {
      setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
    }
  }

  const sub = substances[params.substance]
  const moleCount = params.mass / sub.molarMass
  const avogadro = 6.02e23
  const particleCount = moleCount * avogadro

  return (
    <div className="mole-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">物质</span>
              <select
                value={params.substance}
                onChange={(e) => handleParamChange('substance', e.target.value)}
                className="control-select"
              >
                <option value="water">水 H₂O</option>
                <option value="oxygen">氧气 O₂</option>
                <option value="carbon">二氧化碳 CO₂</option>
                <option value="nitrogen">氮气 N₂</option>
                <option value="hydrogen">氢气 H₂</option>
                <option value="methane">甲烷 CH₄</option>
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">质量: {params.mass}g</span>
              <input
                type="range"
                min="1"
                max="100"
                value={params.mass}
                onChange={(e) => handleParamChange('mass', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">物质的量</span>
            <span className="data-value">{moleCount.toFixed(4)} mol</span>
          </div>
          <div className="data-item">
            <span className="data-label">粒子数</span>
            <span className="data-value">{particleCount.toExponential(2)}</span>
          </div>
          <div className="data-item highlight">
            <span className="data-label">摩尔质量</span>
            <span className="data-value">{sub.molarMass} g/mol</span>
          </div>
        </div>
      </div>

      <div className="animation-formula">
        <h4>⚗️ 摩尔公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">n = m/M</span>
            <span className="formula-desc">物质的量</span>
          </div>
          <div className="formula-item">
            <span className="formula">N = n × NA</span>
            <span className="formula-desc">粒子数</span>
          </div>
          <div className="formula-item">
            <span className="formula">NA = 6.02×10²³</span>
            <span className="formula-desc">阿伏伽德罗常数</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoleAnimation