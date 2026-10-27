import { useEffect, useRef } from 'react'
import { defaultParticleColorList } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import type { CwParticleBackgroundProps } from './types'

const DEFAULT_COLORS: string[] = [...defaultParticleColorList]

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

interface MousePosition {
  x: number | null
  y: number | null
  radius: number
}

/* design-token-check: ignore-start — Canvas 描边：由 tokenSolidColors 的 hex 动态拼 alpha */
function strokeColorFromHex(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
/* design-token-check: ignore-end */

export function CwParticleBackground({
  width = '100%',
  height = '100%',
  count = 0,
  maxSize = 2.5,
  speed = 0.4,
  connectionRadius = 120,
  connectionOpacity = 0.5,
  colors = DEFAULT_COLORS,
  className,
  children,
}: CwParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameIdRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const resizeCanvasRafRef = useRef(0)
  const mousePositionRef = useRef<MousePosition>({ x: null, y: null, radius: 180 })
  const initParticlesRef = useRef<(() => void) | null>(null)

  /** 最新动画参数（绘制循环每帧读取，等价 Vue 闭包内的响应式 props） */
  const settingsRef = useRef({ count, maxSize, speed, connectionRadius, connectionOpacity, colors })
  settingsRef.current = { count, maxSize, speed, connectionRadius, connectionOpacity, colors }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    // 根据canvas尺寸获取粒子数量
    const getParticleCount = () => {
      const settings = settingsRef.current
      if (settings.count > 0) return settings.count

      if (!canvasRef.current) return 50

      const canvasArea = canvasRef.current.width * canvasRef.current.height
      const density = 0.0001 // 每平方像素的粒子数量

      // 基于canvas面积计算粒子数量，但设置上下限
      const particleCount = Math.floor(canvasArea * density)
      return Math.max(20, Math.min(particleCount, 150))
    }

    // 调整canvas大小
    const resizeCanvas = () => {
      if (!canvasRef.current) return

      // 获取父容器尺寸
      const parentElement = canvasRef.current.parentElement
      if (!parentElement) return

      const rect = parentElement.getBoundingClientRect()
      canvasRef.current.width = rect.width
      canvasRef.current.height = rect.height

      // 调整鼠标影响半径根据容器大小
      mousePositionRef.current.radius = Math.min(rect.width, rect.height) * 0.2

      // 重新初始化粒子
      if (particlesRef.current.length > 0) {
        initParticles()
      }
    }

    /** 合并同帧多次 ResizeObserver 回调，避免同步改 canvas 尺寸触发 RO loop 警告 */
    const scheduleResizeCanvas = () => {
      if (resizeCanvasRafRef.current) cancelAnimationFrame(resizeCanvasRafRef.current)
      resizeCanvasRafRef.current = requestAnimationFrame(() => {
        resizeCanvasRafRef.current = 0
        resizeCanvas()
      })
    }

    // 初始化粒子
    const initParticles = () => {
      if (!canvasRef.current || !ctxRef.current) return

      const settings = settingsRef.current
      const particles: Particle[] = []
      const particleCount = getParticleCount()

      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * settings.maxSize + 0.8
        particles.push({
          x: Math.random() * canvasRef.current.width,
          y: Math.random() * canvasRef.current.height,
          size: size,
          speedX: (Math.random() - 0.5) * settings.speed,
          speedY: (Math.random() - 0.5) * settings.speed,
          color: settings.colors[Math.floor(Math.random() * settings.colors.length)],
        })
      }
      particlesRef.current = particles
    }

    // 绘制粒子
    const drawParticles = () => {
      if (!canvasRef.current || !ctxRef.current) return
      const context = ctxRef.current
      const settings = settingsRef.current
      const particles = particlesRef.current
      const mousePosition = mousePositionRef.current

      // 清除画布
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      // 绘制每个粒子和连接线
      particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界检测
        if (particle.x > canvasRef.current!.width) {
          particle.x = 0
        } else if (particle.x < 0) {
          particle.x = canvasRef.current!.width
        }

        if (particle.y > canvasRef.current!.height) {
          particle.y = 0
        } else if (particle.y < 0) {
          particle.y = canvasRef.current!.height
        }

        // 与鼠标交互
        if (mousePosition.x != null && mousePosition.y != null) {
          const dx = mousePosition.x - particle.x
          const dy = mousePosition.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mousePosition.radius) {
            const force = mousePosition.radius / distance
            const angle = Math.atan2(dy, dx)
            particle.x -= Math.cos(angle) * force * 0.1
            particle.y -= Math.sin(angle) * force * 0.1
          }
        }

        // 绘制粒子
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fillStyle = particle.color
        context.fill()

        // 连接附近的粒子
        for (let j = index + 1; j < particles.length; j++) {
          const otherParticle = particles[j]!
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < settings.connectionRadius) {
            context.beginPath()
            context.strokeStyle = strokeColorFromHex(
              particle.color,
              settings.connectionOpacity * (1 - distance / settings.connectionRadius),
            )
            context.lineWidth = 0.6
            context.moveTo(particle.x, particle.y)
            context.lineTo(otherParticle.x, otherParticle.y)
            context.stroke()
          }
        }
      })

      // 继续动画
      animationFrameIdRef.current = requestAnimationFrame(drawParticles)
    }

    // 处理鼠标移动
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      mousePositionRef.current.x = event.clientX - rect.left
      mousePositionRef.current.y = event.clientY - rect.top
    }

    // 处理鼠标离开
    const handleMouseLeave = () => {
      mousePositionRef.current.x = null
      mousePositionRef.current.y = null
    }

    // 处理触摸开始
    const handleTouchStart = (event: TouchEvent) => {
      if (!canvasRef.current || !event.touches[0]) return

      const rect = canvasRef.current.getBoundingClientRect()
      const touch = event.touches[0]
      mousePositionRef.current.x = touch.clientX - rect.left
      mousePositionRef.current.y = touch.clientY - rect.top
    }

    // 处理触摸移动
    const handleTouchMove = (event: TouchEvent) => {
      if (!canvasRef.current || !event.touches[0]) return

      const rect = canvasRef.current.getBoundingClientRect()
      const touch = event.touches[0]
      mousePositionRef.current.x = touch.clientX - rect.left
      mousePositionRef.current.y = touch.clientY - rect.top
    }

    // 处理触摸结束
    const handleTouchEnd = () => {
      mousePositionRef.current.x = null
      mousePositionRef.current.y = null
    }

    // 初始化：调整大小并初始化
    initParticlesRef.current = initParticles
    resizeCanvas()
    initParticles()
    drawParticles()

    // 监听容器尺寸变化
    const parentElement = canvas.parentElement
    if (parentElement) {
      resizeObserverRef.current = new ResizeObserver(() => {
        scheduleResizeCanvas()
      })
      resizeObserverRef.current.observe(parentElement)
    }

    // 添加事件监听
    window.addEventListener('resize', resizeCanvas)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    // 清理
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
      if (resizeCanvasRafRef.current) {
        cancelAnimationFrame(resizeCanvasRafRef.current)
        resizeCanvasRafRef.current = 0
      }

      // 停止监听容器尺寸变化
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      // 移除事件监听
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)

      ctxRef.current = null
      particlesRef.current = []
      initParticlesRef.current = null
    }
  }, [])

  // 监听属性变化（对应 Vue watch → initParticles；首帧由挂载 effect 完成初始化）
  const isFirstWatchRunRef = useRef(true)
  useEffect(() => {
    if (isFirstWatchRunRef.current) {
      isFirstWatchRunRef.current = false
      return
    }
    initParticlesRef.current?.()
  }, [count, maxSize, speed, connectionRadius, connectionOpacity, colors])

  return (
    <div
      ref={containerRef}
      className={['relative overflow-hidden', className].filter(Boolean).join(' ')}
      style={{
        width: width || '100%',
        height: height || '100%',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative">{children}</div>
    </div>
  )
}

export default CwParticleBackground
