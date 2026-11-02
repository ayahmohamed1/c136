'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GiftData } from '@/lib/giftData'
import GiftClient from '@/components/GiftClient'
import styles from '@/components/HomeExperience.module.css'

interface Props {
  data: GiftData
}

interface Particle {
  x: number
  y: number
  order: number
  kind: 'outline' | 'fill'
  word: string
  color: string
  alpha: number
  flicker: number
  delay: number
  size: number
}

const WORDS = ['love you', 'Love You', 'LOVE YOU']
const COLORS = ['#4682b4', '#1e90ff', '#00bfff', '#6495ed', '#4169e1']

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function heartPoint(t: number) {
  const x = 16 * Math.sin(t) ** 3
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return { x, y: -y }
}

function createParticle(x: number, y: number, order: number, kind: Particle['kind']): Particle {
  return {
    x,
    y,
    order,
    kind,
    word: randomItem(WORDS),
    color: randomItem(COLORS),
    alpha: 0,
    flicker: Math.random() * Math.PI * 2,
    delay: 0,
    size: 0.85 + Math.random() * 0.3,
  }
}

function buildParticles(width: number, height: number) {
  const scale = Math.min(width / 38, height / 30)
  const centerX = width / 2
  const centerY = height / 2
  const toScreen = (x: number, y: number) => ({
    x: centerX + x * scale,
    y: centerY + y * scale,
  })

  const outline: Particle[] = []
  const outlinePositions: Array<{ x: number; y: number }> = []
  for (let i = 0; i < 160; i++) {
    const point = heartPoint((i / 160) * Math.PI * 2)
    const position = toScreen(point.x, point.y)
    const minGap = Math.max(12, scale * 1.5)
    if (outlinePositions.some((placed) => Math.hypot(position.x - placed.x, position.y - placed.y) < minGap)) {
      continue
    }
    outlinePositions.push(position)
    outline.push(createParticle(position.x, position.y, i, 'outline'))
  }

  const fill: Particle[] = []
  const fillPositions: Array<{ x: number; y: number }> = []
  let attempts = 0
  while (fill.length < 130 && attempts < 130 * 80) {
    attempts++
    const point = heartPoint(Math.random() * Math.PI * 2)
    const radius = Math.random() * 0.86
    const position = toScreen(point.x * radius, point.y * radius)
    const minGap = Math.max(16, scale * 2.3)
    if (fillPositions.some((placed) => Math.hypot(position.x - placed.x, position.y - placed.y) < minGap)) {
      continue
    }
    fillPositions.push(position)
    fill.push(createParticle(position.x, position.y, Math.floor(Math.random() * 321), 'fill'))
  }

  const outlineSpan = outline.reduce((largest, particle) => Math.max(largest, particle.order), 0)
  const fillStartFrame = Math.floor(outlineSpan * 1.6) + 30
  for (const particle of outline) {
    particle.delay = Math.floor(particle.order * 1.6)
  }
  for (const particle of fill) {
    particle.delay = fillStartFrame + particle.order
  }

  return { particles: [...outline, ...fill], fillStartFrame, scale }
}

function drawGlowText(
  context: CanvasRenderingContext2D,
  particle: Particle,
  frame: number,
  scale: number,
) {
  if (frame <= particle.delay && particle.alpha === 0) return

  if (particle.alpha < 255 && frame > particle.delay) {
    particle.alpha = Math.min(255, particle.alpha + 14 + Math.floor(Math.random() * 5))
  }
  if (particle.alpha <= 0) return

  const flicker = particle.alpha >= 255
    ? 0.75 + 0.25 * Math.sin(frame * 0.04 + particle.flicker)
    : 1
  const fontSize = Math.max(8, (particle.kind === 'outline' ? scale : scale * 0.85) * particle.size)

  context.save()
  context.globalAlpha = (particle.alpha / 255) * flicker
  context.font = `bold ${fontSize}px Arial, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = particle.color
  context.shadowColor = particle.color
  context.shadowBlur = fontSize * 1.2
  context.fillText(particle.word, particle.x, particle.y)
  context.restore()
}

function LoveYouIntro({ onNext }: { onNext: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasMusicError, setHasMusicError] = useState(false)

  const stopMusicAndContinue = useCallback(() => {
    audioRef.current?.pause()
    onNext()
  }, [onNext])

  const playMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      await audio.play()
    } catch {
      // Browsers may block autoplay until the visitor interacts with the page.
    }
  }, [])

  useEffect(() => {
    void playMusic()
    const retryPlayback = () => {
      if (!document.hidden) void playMusic()
    }
    window.addEventListener('pageshow', retryPlayback)
    document.addEventListener('visibilitychange', retryPlayback)
    return () => {
      window.removeEventListener('pageshow', retryPlayback)
      document.removeEventListener('visibilitychange', retryPlayback)
      audioRef.current?.pause()
    }
  }, [playMusic])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let animationFrame = 0
    let frame = 0
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let fillStartFrame = 0
    let scale = 1
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      const scene = buildParticles(width, height)
      particles = scene.particles
      fillStartFrame = scene.fillStartFrame
      scale = scene.scale
      frame = 0
    }

    const draw = () => {
      const currentFrame = reducedMotion ? fillStartFrame + 260 : frame++
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        drawGlowText(context, particle, currentFrame, scale)
      }

      const centerStart = fillStartFrame + 200
      if (currentFrame > centerStart) {
        const progress = Math.min(1, (currentFrame - centerStart) / 60)
        const alpha = 1 - Math.exp(-progress * 8)
        const pulse = 1 + 0.025 * Math.sin(currentFrame * 0.05)
        const fontSize = Math.min(54, Math.max(30, width * 0.08)) * pulse

        context.save()
        context.globalAlpha = alpha
        context.font = `bold ${fontSize}px Georgia, serif`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = '#fffaf5'
        context.shadowColor = '#1e90ff'
        context.shadowBlur = 24
        context.fillText('Love You', width / 2, height / 2)
        context.restore()
      }

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw)
      }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <main
      className={styles.intro}
      onPointerDown={(event) => {
        if (event.target instanceof Element && event.target.closest('button')) return
        void playMusic()
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <h1 className={styles.visuallyHidden}>Love You</h1>
      <audio
        ref={audioRef}
        src="/audio/love_you.mp3"
        autoPlay
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={() => void playMusic()}
        onError={() => setHasMusicError(true)}
      />
      {hasMusicError && (
        <p className={styles.musicError} role="status">تعذر تشغيل الموسيقى</p>
      )}
      <button className={styles.nextButton} type="button" onClick={stopMusicAndContinue}>
        Next <span aria-hidden="true">→</span>
      </button>
    </main>
  )
}

export default function HomeExperience({ data }: Props) {
  const [showIntro, setShowIntro] = useState(true)

  return showIntro
    ? <LoveYouIntro onNext={() => setShowIntro(false)} />
    : <GiftClient data={data} />
}
