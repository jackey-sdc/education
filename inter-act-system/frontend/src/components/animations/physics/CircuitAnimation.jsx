import React, { useRef, useEffect, useState } from 'react'
import './CircuitAnimation.css'

const CircuitAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    voltage: 12,
    resistance1: 100,
    resistance2: 200,
    resistance3: 300,
    circuitType: 'series'
  })
  const [current, setCurrent] = useState({ total: 0, throughR1: 0, throughR2: 0, throughR3: 0 })
  const [electronFlow, setElectronFlow] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 320
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { voltage, resistance1, resistance2, resistance3, circuitType } = params

    // 计算电路
    let totalResistance, currentTotal, powerTotal
    if (circuitType === 'series') {
      totalResistance = resistance1 + resistance2 + resistance3
      currentTotal = voltage / totalResistance
      powerTotal = voltage * voltage / totalResistance
    } else {
      totalResistance = 1 / (1 / resistance1 + 1 / resistance2 + 1 / resistance3)
      currentTotal = voltage / totalResistance
      powerTotal = voltage * voltage / totalResistance
    }

    setCurrent({
      total: currentTotal,
      throughR1: circuitType === 'series' ? currentTotal : voltage / resistance1,
      throughR2: circuitType === 'series' ? currentTotal : voltage / resistance2,
      throughR3: circuitType === 'series' ? currentTotal : voltage / resistance3
    })

    // 绘制电路图背景
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(0, 0, width, height)

    // 电路参数
    const centerX = width / 2
    const centerY = height / 2
    const boxSize = 50

    // 绘制电池
    const batteryX = 60
    const batteryY = centerY - 40
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 3
    // 长线（正）
    ctx.beginPath()
    ctx.moveTo(batteryX, batteryY)
    ctx.lineTo(batteryX, batteryY + 30)
    ctx.stroke()
    // 短线（负）
    ctx.beginPath()
    ctx.moveTo(batteryX - 10, batteryY + 35)
    ctx.lineTo(batteryX + 10, batteryY + 35)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(batteryX - 10, batteryY + 45)
    ctx.lineTo(batteryX + 10, batteryY + 45)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(batteryX, batteryY + 50)
    ctx.lineTo(batteryX, batteryY + 80)
    ctx.stroke()

    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 12px Inter'
    ctx.fillText(`V = ${voltage}V`, batteryX - 20, batteryY + 100)

    // 绘制电阻盒
    const drawResistor = (x, y, label, value, currentI) => {
      // 电阻盒
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize)

      ctx.fillStyle = '#1E40AF'
      ctx.fillRect(x - boxSize / 2 + 3, y - boxSize / 2 + 3, boxSize - 6, boxSize - 6)

      // 电阻 zigzag
      ctx.strokeStyle = '#60A5FA'
      ctx.lineWidth = 2
      ctx.beginPath()
      const zigzagWidth = 30
      const zigzagHeight = 15
      ctx.moveTo(x - zigzagWidth / 2, y)
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(x - zigzagWidth / 2 + zigzagWidth / 4 + (i % 2) * zigzagWidth / 2, y + (i % 2 === 0 ? -zigzagHeight / 2 : zigzagHeight / 2))
      }
      ctx.lineTo(x + zigzagWidth / 2, y)
      ctx.stroke()

      // 标签
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 11px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, y - boxSize / 2 - 8)
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px Inter'
      ctx.fillText(`${value}Ω`, x, y - boxSize / 2 - 20)
      ctx.fillStyle = '#10B981'
      ctx.font = '10px Inter'
      ctx.fillText(`I=${currentI.toFixed(2)}A`, x, y + boxSize / 2 + 18)
    }

    // 根据电路类型绘制
    if (circuitType === 'series') {
      // 串联电路
      const startX = 150
      const startY = 80

      // 连线 - 从电池正极开始
      ctx.strokeStyle = '#6B7280'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(batteryX, batteryY)
      ctx.lineTo(startX, batteryY)
      ctx.lineTo(startX, startY + boxSize / 2)
      ctx.stroke()

      // R1
      drawResistor(startX, startY, 'R₁', resistance1, current.throughR1)

      // 连线到 R2
      ctx.strokeStyle = '#6B7280'
      ctx.beginPath()
      ctx.moveTo(startX + boxSize / 2, startY)
      ctx.lineTo(startX + 80, startY)
      ctx.lineTo(startX + 80, centerY)
      ctx.stroke()

      // R2
      drawResistor(startX + 80, centerY, 'R₂', resistance2, current.throughR2)

      // 连线到 R3
      ctx.strokeStyle = '#6B7280'
      ctx.beginPath()
      ctx.moveTo(startX + 80 + boxSize / 2, centerY)
      ctx.lineTo(startX + 80 + 80, centerY)
      ctx.lineTo(startX + 80 + 80, height - 80)
      ctx.stroke()

      // R3
      drawResistor(startX + 80 + 80, height - 80, 'R₃', resistance3, current.throughR3)

      // 回到电池负极
      ctx.strokeStyle = '#6B7280'
      ctx.beginPath()
      ctx.moveTo(startX + 80 + 80 + boxSize / 2, height - 80)
      ctx.lineTo(width - 60, height - 80)
      ctx.lineTo(width - 60, batteryY + 80)
      ctx.lineTo(batteryX, batteryY + 80)
      ctx.stroke()

    } else {
      // 并联电路
      const r1X = centerX - 80
      const r2X = centerX + 80
      const rY = centerY - 40

      // 主回路
      ctx.strokeStyle = '#6B7280'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(batteryX, batteryY)
      ctx.lineTo(batteryX, rY)
      ctx.lineTo(r1X - boxSize / 2, rY)
      ctx.stroke()

      // R1 支路
      ctx.beginPath()
      ctx.moveTo(r1X - boxSize / 2, rY)
      ctx.lineTo(r1X - boxSize / 2, rY + 80)
      ctx.stroke()
      drawResistor(r1X, rY + 40, 'R₁', resistance1, current.throughR1)
      ctx.beginPath()
      ctx.moveTo(r1X + boxSize / 2, rY + 40)
      ctx.lineTo(r1X + boxSize / 2, rY + 80)
      ctx.stroke()

      // R2 支路
      ctx.beginPath()
      ctx.moveTo(r2X - boxSize / 2, rY)
      ctx.lineTo(r2X - boxSize / 2, rY + 80)
      ctx.stroke()
      drawResistor(r2X, rY + 40, 'R₂', resistance2, current.throughR2)
      ctx.beginPath()
      ctx.moveTo(r2X + boxSize / 2, rY + 40)
      ctx.lineTo(r2X + boxSize / 2, rY + 80)
      ctx.stroke()

      // 汇合
      ctx.beginPath()
      ctx.moveTo(r1X + boxSize / 2, rY + 80)
      ctx.lineTo(width - 60, rY + 80)
      ctx.lineTo(width - 60, batteryY + 80)
      ctx.lineTo(batteryX, batteryY + 80)
      ctx.stroke()

      // 连接 R1 和 R2 顶部
      ctx.beginPath()
      ctx.moveTo(r1X - boxSize / 2, rY)
      ctx.lineTo(r2X + boxSize / 2, rY)
      ctx.stroke()

      // 连接 R1 和 R2 底部
      ctx.beginPath()
      ctx.moveTo(r1X - boxSize / 2, rY + 80)
      ctx.lineTo(r1X + boxSize / 2, rY + 80)
      ctx.moveTo(r2X - boxSize / 2, rY + 80)
      ctx.lineTo(r2X + boxSize / 2, rY + 80)
      ctx.stroke()
    }

    // 电流流动动画
    const flowOffset = (electronFlow % 40) / 40
    ctx.fillStyle = '#EF4444'
    for (let i = 0; i < 8; i++) {
      const pos = (flowOffset + i * 0.125) % 1
      ctx.beginPath()
      ctx.arc(0, 0, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 数据面板
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(width - 150, 20, 130, 100)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(width - 150, 20, 130, 100)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 11px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('电路计算', width - 140, 38)
    ctx.font = '10px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`总电阻: ${totalResistance.toFixed(1)}Ω`, width - 140, 56)
    ctx.fillStyle = '#F59E0B'
    ctx.fillText(`总电压: ${voltage}V`, width - 140, 72)
    ctx.fillStyle = '#10B981'
    ctx.fillText(`总电流: ${currentTotal.toFixed(2)}A`, width - 140, 88)
    ctx.fillStyle = '#EC4899'
    ctx.fillText(`总功率: ${powerTotal.toFixed(1)}W`, width - 140, 104)

  }, [params, electronFlow])

  useEffect(() => {
    if (!current.total) return

    const interval = setInterval(() => {
      setElectronFlow(prev => prev + 2)
    }, 50)

    return () => clearInterval(interval)
  }, [current.total, params])

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  return (
    <div className="circuit-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">电路类型</span>
              <select
                value={params.circuitType}
                onChange={(e) => setParams(prev => ({ ...prev, circuitType: e.target.value }))}
                className="control-select"
              >
                <option value="series">串联</option>
                <option value="parallel">并联</option>
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">电压 V: {params.voltage}V</span>
              <input
                type="range"
                min="1"
                max="24"
                value={params.voltage}
                onChange={(e) => handleParamChange('voltage', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">R₁: {params.resistance1}Ω</span>
              <input
                type="range"
                min="50"
                max="500"
                value={params.resistance1}
                onChange={(e) => handleParamChange('resistance1', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">R₂: {params.resistance2}Ω</span>
              <input
                type="range"
                min="50"
                max="500"
                value={params.resistance2}
                onChange={(e) => handleParamChange('resistance2', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">R₃: {params.resistance3}Ω</span>
              <input
                type="range"
                min="50"
                max="500"
                value={params.resistance3}
                onChange={(e) => handleParamChange('resistance3', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-formula">
        <h4>⚡ 电路公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">U = IR</span>
            <span className="formula-desc">欧姆定律</span>
          </div>
          <div className="formula-item">
            <span className="formula">P = UI</span>
            <span className="formula-desc">电功率</span>
          </div>
          <div className="formula-item">
            <span className="formula">{params.circuitType === 'series' ? 'R = R₁+R₂+R₃' : '1/R = 1/R₁+1/R₂+1/R₃'}</span>
            <span className="formula-desc">总电阻</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CircuitAnimation