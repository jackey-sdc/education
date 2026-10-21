import React, { useRef, useEffect, useState } from 'react'
import './AcidBaseAnimation.css'

const AcidBaseAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    acidType: 'hcl',
    baseType: 'naoh',
    acidConcentration: 0.1,
    baseConcentration: 0.1,
    acidVolume: 20,
    baseVolume: 0
  })
  const [isReacting, setIsReacting] = useState(false)
  const [reactionState, setReactionState] = useState({
    currentBaseVolume: 0,
    ph: 7,
    isComplete: false
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 300
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { currentBaseVolume } = reactionState
    const { acidConcentration, acidVolume, baseConcentration } = params

    // 计算 pH
    const molesH = acidConcentration * acidVolume / 1000
    const molesOH = baseConcentration * currentBaseVolume / 1000
    const molesHRemaining = Math.max(0, molesH - molesOH)

    let ph = 7
    if (molesHRemaining > 0) {
      const hConcentration = molesHRemaining / ((acidVolume + currentBaseVolume) / 1000)
      ph = -Math.log10(hConcentration)
    } else if (molesOH > molesH) {
      const ohConcentration = (molesOH - molesH) / ((acidVolume + currentBaseVolume) / 1000)
      ph = 14 + Math.log10(ohConcentration)
    }

    // 绘制烧杯
    const beakerX = 80
    const beakerY = 80
    const beakerWidth = 150
    const beakerHeight = 180
    const maxVolume = 50
    const liquidHeight = (currentBaseVolume / maxVolume) * beakerHeight * 0.7

    // 烧杯轮廓
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(beakerX, beakerY)
    ctx.lineTo(beakerX, beakerY + beakerHeight)
    ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight)
    ctx.lineTo(beakerX + beakerWidth, beakerY)
    ctx.stroke()

    // 液面
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(beakerX + 2, beakerY + beakerHeight - liquidHeight, beakerWidth - 4, liquidHeight)

    // 根据 pH 绘制颜色
    let liquidColor
    if (ph < 3) liquidColor = '#DC2626'
    else if (ph < 5) liquidColor = '#F97316'
    else if (ph < 6) liquidColor = '#FBBF24'
    else if (ph < 8) liquidColor = '#22C55E'
    else if (ph < 10) liquidColor = '#3B82F6'
    else if (ph < 12) liquidColor = '#8B5CF6'
    else liquidColor = '#DC2626'

    ctx.fillStyle = liquidColor
    ctx.globalAlpha = 0.7
    ctx.fillRect(beakerX + 2, beakerY + beakerHeight - liquidHeight, beakerWidth - 4, liquidHeight)
    ctx.globalAlpha = 1

    // 滴管
    const dropperX = beakerX + beakerWidth + 80
    const dropperY = beakerY
    const dropperWidth = 30
    const dropperHeight = 100

    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 2
    ctx.strokeRect(dropperX, dropperY, dropperWidth, dropperHeight)

    // 滴管内的液体
    ctx.fillStyle = '#3B82F6'
    ctx.fillRect(dropperX + 2, dropperY + 10, dropperWidth - 4, dropperHeight - 15)

    // 液滴
    if (isReacting && currentBaseVolume > 0) {
      ctx.fillStyle = '#3B82F6'
      ctx.beginPath()
      ctx.arc(dropperX + dropperWidth / 2, dropperY + dropperHeight + 5, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // pH 试纸
    const paperX = beakerX + beakerWidth + 50
    const paperY = beakerY + 50
    const paperWidth = 60
    const paperHeight = 80

    // 试纸背景
    const gradient = ctx.createLinearGradient(paperX, paperY, paperX + paperWidth, paperY)
    gradient.addColorStop(0, '#DC2626')
    gradient.addColorStop(0.17, '#F97316')
    gradient.addColorStop(0.33, '#FBBF24')
    gradient.addColorStop(0.5, '#22C55E')
    gradient.addColorStop(0.67, '#3B82F6')
    gradient.addColorStop(0.83, '#8B5CF6')
    gradient.addColorStop(1, '#DC2626')

    ctx.fillStyle = gradient
    ctx.fillRect(paperX, paperY, paperWidth, paperHeight)

    // 试纸指示
    const indicatorX = paperX + (ph / 14) * paperWidth
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(indicatorX, paperY)
    ctx.lineTo(indicatorX, paperY + paperHeight)
    ctx.stroke()

    // pH 数值显示
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(paperX, paperY + paperHeight + 10, paperWidth, 25)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(`pH = ${ph.toFixed(1)}`, paperX + paperWidth / 2, paperY + paperHeight + 28)

    // 数据面板
    const dataX = 300
    const dataY = 120

    ctx.fillStyle = '#1E293B'
    ctx.fillRect(dataX, dataY, 180, 150)
    ctx.strokeStyle = '#374151'
    ctx.strokeRect(dataX, dataY, 180, 150)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('滴定数据', dataX + 10, dataY + 20)

    ctx.font = '11px Inter'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(`酸: ${(acidConcentration).toFixed(2)} mol/L`, dataX + 10, dataY + 45)
    ctx.fillText(`碱: ${(baseConcentration).toFixed(2)} mol/L`, dataX + 10, dataY + 65)
    ctx.fillText(`酸体积: ${acidVolume} mL`, dataX + 10, dataY + 85)
    ctx.fillText(`碱体积: ${currentBaseVolume.toFixed(1)} mL`, dataX + 10, dataY + 105)

    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 12px Inter'
    ctx.fillText(`pH = ${ph.toFixed(2)}`, dataX + 10, dataY + 130)

    // 离子示意
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '10px Inter'
    ctx.fillText('H⁺: ' + (molesHRemaining * 1000).toFixed(3) + ' mmol', dataX + 10, dataY + 145)
    ctx.fillText('OH⁻: ' + (Math.max(0, molesOH - molesH) * 1000).toFixed(3) + ' mmol', dataX + 100, dataY + 145)

    // 化学反应方程式
    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('HCl + NaOH → NaCl + H₂O', width / 2, 40)

  }, [params, reactionState, isReacting])

  const startReaction = () => {
    setIsReacting(true)
    setReactionState(prev => ({ ...prev, currentBaseVolume: 0, isComplete: false }))

    const interval = setInterval(() => {
      setReactionState(prev => {
        const newVolume = prev.currentBaseVolume + 0.5
        const maxVolume = (params.acidConcentration * params.acidVolume) / params.baseConcentration

        if (newVolume >= maxVolume) {
          clearInterval(interval)
          setIsReacting(false)
          return { ...prev, currentBaseVolume: maxVolume, isComplete: true }
        }

        return { ...prev, currentBaseVolume: newVolume }
      })
    }, 50)
  }

  const resetReaction = () => {
    setIsReacting(false)
    setReactionState({
      currentBaseVolume: 0,
      ph: 7,
      isComplete: false
    })
  }

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
  }

  return (
    <div className="acid-base-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">酸浓度: {params.acidConcentration}mol/L</span>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={params.acidConcentration}
                onChange={(e) => handleParamChange('acidConcentration', e.target.value)}
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">碱浓度: {params.baseConcentration}mol/L</span>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={params.baseConcentration}
                onChange={(e) => handleParamChange('baseConcentration', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">酸体积: {params.acidVolume}mL</span>
              <input
                type="range"
                min="10"
                max="50"
                value={params.acidVolume}
                onChange={(e) => handleParamChange('acidVolume', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="animation-buttons">
        <button className="btn-primary" onClick={startReaction} disabled={isReacting}>▶ 开始滴定</button>
        <button className="btn-secondary" onClick={resetReaction}>🔄 重置</button>
      </div>

      <div className="animation-data">
        <div className="data-row">
          <div className="data-item">
            <span className="data-label">碱体积</span>
            <span className="data-value">{reactionState.currentBaseVolume.toFixed(1)}mL</span>
          </div>
          <div className="data-item highlight">
            <span className="data-label">当前pH</span>
            <span className="data-value">{(() => {
              const mH = params.acidConcentration * params.acidVolume / 1000
              const mOH = params.baseConcentration * reactionState.currentBaseVolume / 1000
              const remaining = Math.max(0, mH - mOH)
              if (remaining > 0) {
                const hc = remaining / ((params.acidVolume + reactionState.currentBaseVolume) / 1000)
                return (-Math.log10(hc)).toFixed(2)
              } else if (mOH > mH) {
                const ohc = (mOH - mH) / ((params.acidVolume + reactionState.currentBaseVolume) / 1000)
                return (14 + Math.log10(ohc)).toFixed(2)
              }
              return '7.00'
            })()}</span>
          </div>
          <div className="data-item">
            <span className="data-label">状态</span>
            <span className="data-value">{reactionState.isComplete ? '滴定完成' : (isReacting ? '滴定中' : '待开始')}</span>
          </div>
        </div>
      </div>

      <div className="animation-formula">
        <h4>🧪 酸碱滴定公式</h4>
        <div className="formula-grid">
          <div className="formula-item">
            <span className="formula">pH = -log[H⁺]</span>
            <span className="formula-desc">pH定义</span>
          </div>
          <div className="formula-item">
            <span className="formula">C₁V₁ = C₂V₂</span>
            <span className="formula-desc">滴定公式</span>
          </div>
          <div className="formula-item">
            <span className="formula">pH + pOH = 14</span>
            <span className="formula-desc">水的离子积</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcidBaseAnimation