import React, { useRef, useEffect, useState, useCallback } from 'react'
import './ReactionAnimation.css'

const ReactionAnimation = ({ h2: initH2 = 1, o2: initO2 = 1 }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [params, setParams] = useState({
    h2: initH2,
    o2: initO2
  })
  const [stage, setStage] = useState('initial')
  const [progress, setProgress] = useState(0)
  const [molecules, setMolecules] = useState([])
  const [reactionResult, setReactionResult] = useState(null)

  const generateMolecules = useCallback(() => {
    const h2Count = Math.round(params.h2)
    const o2Count = Math.round(params.o2)
    const newMolecules = []

    for (let i = 0; i < h2Count; i++) {
      newMolecules.push({
        id: `h2_${i}`,
        type: 'H2',
        x: 50 + Math.random() * 150,
        y: 100 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        bonded: false,
        color: '#EF4444'
      })
    }

    for (let i = 0; i < o2Count; i++) {
      newMolecules.push({
        id: `o2_${i}`,
        type: 'O2',
        x: 350 + Math.random() * 150,
        y: 100 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        bonded: false,
        color: '#3B82F6'
      })
    }

    setMolecules(newMolecules)
  }, [params.h2, params.o2])

  useEffect(() => {
    generateMolecules()
    setStage('initial')
    setProgress(0)
    setReactionResult(null)
  }, [generateMolecules])

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, '#0F172A')
    bgGradient.addColorStop(1, '#1E293B')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    if (stage === 'initial' || stage === 'reacting') {
      ctx.fillStyle = '#1E40AF'
      ctx.font = 'bold 14px Inter'
      ctx.fillText('H₂ 区域', 80, 50)
      ctx.strokeStyle = '#3B82F6'
      ctx.setLineDash([5, 5])
      ctx.strokeRect(40, 60, 180, 280)
      ctx.setLineDash([])

      ctx.fillStyle = '#B91C1C'
      ctx.fillText('O₂ 区域', 380, 50)
      ctx.strokeStyle = '#EF4444'
      ctx.strokeRect(340, 60, 180, 280)
    }

    molecules.forEach(mol => {
      if (mol.type === 'H2') {
        drawH2Molecule(ctx, mol.x, mol.y, mol.bonded)
      } else {
        drawO2Molecule(ctx, mol.x, mol.y, mol.bonded)
      }
    })

    if (stage === 'combining') {
      const reactProgress = progress / 100
      const centerX = width / 2
      const centerY = height / 2

      for (let i = 0; i < 20 * reactProgress; i++) {
        const angle = (i / 20) * Math.PI * 2
        const radius = 50 * reactProgress
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(250, 204, 21, ${reactProgress})`
        ctx.fill()
      }
    }

    if (stage === 'complete' && reactionResult) {
      drawH2OMolecules(ctx, width, height, reactionResult.h2o)
    }
  }, [molecules, stage, progress, reactionResult])

  const drawH2Molecule = (ctx, x, y, bonded) => {
    const radius = bonded ? 12 : 10

    ctx.beginPath()
    ctx.arc(x - 6, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bonded ? '#FCA5A5' : '#EF4444'
    ctx.fill()
    ctx.strokeStyle = '#B91C1C'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x + 6, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bonded ? '#FCA5A5' : '#EF4444'
    ctx.fill()
    ctx.stroke()

    if (!bonded) {
      ctx.beginPath()
      ctx.moveTo(x - 6, y - radius)
      ctx.lineTo(x + 6, y - radius)
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(x - 6, y)
      ctx.lineTo(x + 6, y)
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 10px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('H', x - 6, y + 3)
    ctx.fillText('H', x + 6, y + 3)
  }

  const drawO2Molecule = (ctx, x, y, bonded) => {
    const radius = bonded ? 14 : 12

    ctx.beginPath()
    ctx.arc(x - 8, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bonded ? '#93C5FD' : '#3B82F6'
    ctx.fill()
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x + 8, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bonded ? '#93C5FD' : '#3B82F6'
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x - 8, y)
    ctx.lineTo(x + 8, y)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = bonded ? 4 : 2
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x - 8, y - radius)
    ctx.lineTo(x + 8, y - radius)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('O', x - 8, y + 4)
    ctx.fillText('O', x + 8, y + 4)
  }

  const drawH2OMolecules = (ctx, width, height, count) => {
    ctx.fillStyle = '#06B6D4'
    ctx.font = 'bold 14px Inter'
    ctx.fillText('H₂O 产物区', width / 2 - 40, 50)
    ctx.strokeStyle = '#06B6D4'
    ctx.setLineDash([5, 5])
    ctx.strokeRect(width / 2 - 150, 60, 300, 280)
    ctx.setLineDash([])

    for (let i = 0; i < count; i++) {
      const x = width / 2 - 100 + (i % 4) * 80
      const y = 120 + Math.floor(i / 4) * 100
      drawH2OMolecule(ctx, x, y)
    }
  }

  const drawH2OMolecule = (ctx, x, y) => {
    ctx.beginPath()
    ctx.arc(x, y, 14, 0, Math.PI * 2)
    ctx.fillStyle = '#06B6D4'
    ctx.fill()
    ctx.strokeStyle = '#0891B2'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x - 14, y)
    ctx.lineTo(x - 28, y - 10)
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 8
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x - 28, y - 10)
    ctx.arc(x - 32, y - 14, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#EF4444'
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x - 28, y - 10)
    ctx.arc(x - 24, y - 16, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#EF4444'
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x + 14, y)
    ctx.lineTo(x + 28, y - 10)
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 8
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x + 28, y - 10)
    ctx.arc(x + 24, y - 14, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#3B82F6'
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x + 28, y - 10)
    ctx.arc(x + 32, y - 16, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#3B82F6'
    ctx.fill()
    ctx.stroke()
  }

  useEffect(() => {
    drawScene()
  }, [drawScene])

  const animateReaction = () => {
    setStage('combining')
    setProgress(0)

    let currentProgress = 0
    const animate = () => {
      currentProgress += 2
      setProgress(currentProgress)

      if (currentProgress < 100) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setStage('complete')
        const h2oProduced = Math.min(params.h2, params.o2 / 0.5)
        const h2Remaining = params.h2 - h2oProduced
        const o2Remaining = params.o2 - h2oProduced * 2

        setReactionResult({
          h2o: h2oProduced,
          h2Remaining: Math.max(0, h2Remaining),
          o2Remaining: Math.max(0, o2Remaining)
        })
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const resetReaction = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    generateMolecules()
    setStage('initial')
    setProgress(0)
    setReactionResult(null)
  }

  const reactionEquation = `2H₂ + O₂ → 2H₂O`
  const maxH2O = Math.min(params.h2, params.o2 / 0.5)

  return (
    <div className="reaction-animation">
      <div className="animation-canvas-container">
        <canvas
          ref={canvasRef}
          className="animation-canvas"
        />
      </div>

      <div className="animation-equation">
        <span className="equation">{reactionEquation}</span>
      </div>

      <div className="animation-info">
        <div className="info-card h2">
          <span className="info-symbol">H₂</span>
          <span className="info-count">{params.h2} mol</span>
          {reactionResult && (
            <span className="info-remaining">
              剩余: {reactionResult.h2Remaining.toFixed(1)} mol
            </span>
          )}
        </div>
        <div className="info-card o2">
          <span className="info-symbol">O₂</span>
          <span className="info-count">{params.o2} mol</span>
          {reactionResult && (
            <span className="info-remaining">
              剩余: {reactionResult.o2Remaining.toFixed(1)} mol
            </span>
          )}
        </div>
        <div className="info-card h2o">
          <span className="info-symbol">H₂O</span>
          <span className="info-count">
            {reactionResult ? reactionResult.h2o.toFixed(1) : maxH2O.toFixed(1)} mol
          </span>
          <span className="info-produced">预计产量</span>
        </div>
      </div>

      <div className="animation-controls">
        <div className="control-group">
          <label>
            <span className="control-label">H₂ 物质的量</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={params.h2}
              onChange={(e) => setParams(prev => ({ ...prev, h2: parseFloat(e.target.value) }))}
              disabled={stage !== 'initial'}
            />
            <span className="control-value">{params.h2} mol</span>
          </label>
        </div>

        <div className="control-group">
          <label>
            <span className="control-label">O₂ 物质的量</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={params.o2}
              onChange={(e) => setParams(prev => ({ ...prev, o2: parseFloat(e.target.value) }))}
              disabled={stage !== 'initial'}
            />
            <span className="control-value">{params.o2} mol</span>
          </label>
        </div>
      </div>

      <div className="animation-buttons">
        <button
          className="btn-primary"
          onClick={animateReaction}
          disabled={stage !== 'initial'}
        >
          {stage === 'initial' ? '点燃' : stage === 'complete' ? '反应完成' : '反应中...'}
        </button>
        <button
          className="btn-outline"
          onClick={resetReaction}
          disabled={stage === 'initial'}
        >
          重置
        </button>
      </div>

      {reactionResult && (
        <div className="reaction-summary">
          <h4>反应结果</h4>
          <p>
            H₂ 和 O₂ 发生燃烧反应，生成 {reactionResult.h2o.toFixed(1)} mol H₂O
          </p>
          {reactionResult.h2Remaining > 0 && (
            <p className="warning">⚠️ H₂ 过量，剩余 {reactionResult.h2Remaining.toFixed(1)} mol</p>
          )}
          {reactionResult.o2Remaining > 0 && (
            <p className="warning">⚠️ O₂ 过量，剩余 {reactionResult.o2Remaining.toFixed(1)} mol</p>
          )}
        </div>
      )}

      <div className="animation-hint">
        <p>💡 调整 H₂ 和 O₂ 的量，点击"点燃"观察化学反应过程</p>
      </div>
    </div>
  )
}

export default ReactionAnimation
