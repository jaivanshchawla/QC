import { useEffect, useRef } from 'react'

interface ConvergenceChartProps {
  history: number[]
}

export default function ConvergenceChart({ history }: ConvergenceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = 'var(--card)'
    ctx.fillRect(0, 0, W, H)

    // Dashed line at 0.5
    ctx.strokeStyle = 'rgba(255, 219, 51, 0.25)'
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()
    ctx.setLineDash([])

    if (history.length < 2) return

    // Draw line
    ctx.strokeStyle = 'var(--win)'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.beginPath()
    history.forEach((p, i) => {
      const x = (i / (history.length - 1)) * W
      const y = (1 - p) * H
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    history.forEach((p, i) => {
      const x = (i / (history.length - 1)) * W
      const y = (1 - p) * H
      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'var(--win)'
      ctx.fill()
    })

    // Labels
    ctx.fillStyle = 'rgba(122, 117, 158, 0.8)'
    ctx.font = '10px Space Mono, monospace'
    ctx.fillText('0.0', 4, H - 4)
    ctx.fillText('0.5', 4, H / 2 - 3)
    ctx.fillText('1.0', 4, 12)
  }, [history])

  return (
    <div className="qc-card">
      <div className="qc-section-title">convergence (shots vs P)</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="qc-conv-canvas"
      />
      <div className="qc-conv-label">
        P(|0⟩) over last 20 shots — should approach 0.50
      </div>
    </div>
  )
}