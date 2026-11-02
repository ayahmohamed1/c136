'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode, PointerEvent } from 'react'

interface ScratchCardProps {
  children: ReactNode
  revealed: boolean
  onReveal: () => void
  className?: string
  style?: CSSProperties
}

export default function ScratchCard({
  children,
  revealed,
  onReveal,
  className,
  style,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isScratchingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || revealed) return

    const bounds = canvas.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = Math.round(bounds.width * pixelRatio)
    canvas.height = Math.round(bounds.height * pixelRatio)

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#5aa9ff')
    gradient.addColorStop(1, '#164f9a')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'rgba(255, 255, 255, 0.22)'
    const dotSpacing = Math.max(12, Math.round(18 * pixelRatio))
    for (let x = dotSpacing / 2; x < canvas.width; x += dotSpacing) {
      for (let y = dotSpacing / 2; y < canvas.height; y += dotSpacing) {
        context.beginPath()
        context.arc(x, y, Math.max(1, pixelRatio), 0, Math.PI * 2)
        context.fill()
      }
    }

    const fontSize = Math.max(11, Math.min(bounds.width * 0.12, bounds.height * 0.22)) * pixelRatio
    context.font = `700 ${fontSize}px Nunito, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.shadowColor = 'rgba(0, 0, 0, 0.3)'
    context.shadowBlur = 4 * pixelRatio
    context.fillStyle = '#fff'
    context.fillText('Scratch me', canvas.width / 2, canvas.height / 2)
  }, [revealed])

  const scratchAt = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const bounds = canvas.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.width
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.height
    const brushSize = Math.max(24, Math.min(bounds.width, bounds.height) * 0.12)
      * (window.devicePixelRatio || 1)

    context.globalCompositeOperation = 'destination-out'
    context.lineWidth = brushSize
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 0.1, y + 0.1)
    context.stroke()
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    isScratchingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    scratchAt(event)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (isScratchingRef.current) scratchAt(event)
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return
    isScratchingRef.current = false

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
    const sampleStep = 24
    let remaining = 0
    let sampled = 0

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        if (data[(y * width + x) * 4 + 3] > 0) remaining += 1
        sampled += 1
      }
    }

    if (sampled > 0 && remaining / sampled < 0.58) onReveal()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className={`scratch-card-container${className ? ` ${className}` : ''}`} style={style}>
      {children}
      {!revealed && (
        <div className="scratch-card-overlay">
          <canvas
            ref={canvasRef}
            aria-label="Scratch to reveal the photo"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      )}
    </div>
  )
}
