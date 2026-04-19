import React, { useRef, useEffect, useState } from 'react'
import './SequenceAnimation.css'

const SequenceAnimation = ({}) => {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({
    firstTerm: 1,
    commonDiff: 2,
    ratio: 3,
    numTerms: 10
  })
  const [sequenceType, setSequenceType] = useState('arithmetic')
  const [animatedIndex, setAnimatedIndex] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 300
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const { firstTerm, commonDiff, ratio, numTerms } = params

    // 绘制标题
    ctx.fillStyle = '#6366F1'
    ctx.font = 'bold 16px Inter'
    ctx.textAlign = 'center'
    if (sequenceType === 'arithmetic') {
      ctx.fillText(`等差数列: a₁ = ${firstTerm}, d = ${commonDiff}`, width / 2, 25)
    } else {
      ctx.fillText(`等比数列: a₁ = ${firstTerm}, q = ${ratio}`, width / 2, 25)
    }

    // 计算数列
    const terms = []
    if (sequenceType === 'arithmetic') {
      for (let i = 0; i < numTerms; i++) {
        terms.push(firstTerm + i * commonDiff)
      }
    } else {
      for (let i = 0; i < numTerms; i++) {
        terms.push(firstTerm * Math.pow(ratio, i))
      }
    }

    // 找出最大最小值用于缩放
    const maxVal = Math.max(...terms)
    const minVal = Math.min(...terms)
    const range = maxVal - minVal || 1

    const barWidth = (width - 80) / numTerms
    const chartHeight = height - 80
    const startY = 50

    // 绘制条形图
    terms.forEach((term, index) => {
      const x = 40 + index * barWidth
      const barHeight = ((term - minVal + range * 0.1) / (range * 1.2)) * chartHeight
      const y = startY + chartHeight - barHeight

      // 条形颜色
      if (index <= animatedIndex) {
        const hue = 240 + (index / numTerms) * 60
        ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
      } else {
        ctx.fillStyle = '#4B5563'
      }

      // 绘制条形
      ctx.fillRect(x, y, barWidth - 4, barHeight)

      // 数值标签
      ctx.fillStyle = index <= animatedIndex ? '#FFFFFF' : '#9CA3AF'
      ctx.font = `${10}px Inter`
      ctx.textAlign = 'center'
      const displayVal = term > 1000 ? term.toExponential(1) : term.toFixed(1)
      ctx.fillText(displayVal, x + barWidth / 2 - 2, y - 5)

      // 项数标签
      ctx.fillStyle = '#6B7280'
      ctx.font = `${10}px Inter`
      ctx.fillText(`a${index + 1}`, x + barWidth / 2 - 2, startY + chartHeight + 15)
    })

    // 绘制求和公式
    const sum = terms.reduce((a, b) => a + b, 0)
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    if (sequenceType === 'arithmetic') {
      const n = numTerms
      const Sn = n * (2 * firstTerm + (n - 1) * commonDiff) / 2
      ctx.fillText(`求和公式: Sn = n(a₁ + aₙ)/2 = ${n}×(${firstTerm} + ${terms[n-1]})/2 = ${Sn}`, 40, height - 15)
    } else {
      const n = numTerms
      const Sn = ratio === 1 ? n * firstTerm : firstTerm * (1 - Math.pow(ratio, n)) / (1 - ratio)
      ctx.fillText(`求和公式: Sn = a₁(1 - qⁿ)/(1 - q) = ${Sn.toFixed(2)}`, 40, height - 15)
    }

  }, [params, sequenceType, animatedIndex])

  const generateSequence = () => {
    setAnimatedIndex(-1)
    const { firstTerm, commonDiff, ratio, numTerms } = params
    const terms = []
    
    if (sequenceType === 'arithmetic') {
      for (let i = 0; i < numTerms; i++) {
        terms.push(firstTerm + i * commonDiff)
      }
    } else {
      for (let i = 0; i < numTerms; i++) {
        terms.push(firstTerm * Math.pow(ratio, i))
      }
    }

    let index = 0
    const interval = setInterval(() => {
      if (index < terms.length) {
        setAnimatedIndex(index)
        index++
      } else {
        clearInterval(interval)
      }
    }, 200)
  }

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: parseFloat(value) }))
    setAnimatedIndex(-1)
  }

  return (
    <div className="sequence-animation">
      <div className="animation-canvas-container">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="animation-controls">
        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">数列类型</span>
              <select
                value={sequenceType}
                onChange={(e) => {
                  setSequenceType(e.target.value)
                  setAnimatedIndex(-1)
                }}
                className="control-select"
              >
                <option value="arithmetic">等差数列</option>
                <option value="geometric">等比数列</option>
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              <span className="control-label">项数: {params.numTerms}</span>
              <input
                type="range"
                min="3"
                max="15"
                value={params.numTerms}
                onChange={(e) => handleParamChange('numTerms', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>
              <span className="control-label">首项 a₁: {params.firstTerm}</span>
              <input
                type="range"
                min="1"
                max="20"
                value={params.firstTerm}
                onChange={(e) => handleParamChange('firstTerm', e.target.value)}
              />
            </label>
          </div>
          {sequenceType === 'arithmetic' ? (
            <div className="control-group">
              <label>
                <span className="control-label">公差 d: {params.commonDiff}</span>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  value={params.commonDiff}
                  onChange={(e) => handleParamChange('commonDiff', e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="control-group">
              <label>
                <span className="control-label">公比 q: {params.ratio}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={params.ratio}
                  onChange={(e) => handleParamChange('ratio', e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="animation-buttons">
        <button className="btn-primary" onClick={generateSequence}>
          ▶ 动画演示
        </button>
      </div>

      <div className="animation-formula">
        <h4>📊 数列公式</h4>
        <div className="formula-grid">
          {sequenceType === 'arithmetic' ? (
            <>
              <div className="formula-item">
                <span className="formula">aₙ = a₁ + (n-1)d</span>
                <span className="formula-desc">通项公式</span>
              </div>
              <div className="formula-item">
                <span className="formula">Sn = n(a₁ + aₙ)/2</span>
                <span className="formula-desc">求和公式</span>
              </div>
              <div className="formula-item">
                <span className="formula">Sn = n·2a₁+(n-1)d/2</span>
                <span className="formula-desc">求和公式2</span>
              </div>
            </>
          ) : (
            <>
              <div className="formula-item">
                <span className="formula">aₙ = a₁ · qⁿ⁻¹</span>
                <span className="formula-desc">通项公式</span>
              </div>
              <div className="formula-item">
                <span className="formula">Sn = a₁(1-qⁿ)/(1-q)</span>
                <span className="formula-desc">q≠1求和</span>
              </div>
              <div className="formula-item">
                <span className="formula">Sn = n·a₁</span>
                <span className="formula-desc">q=1求和</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SequenceAnimation