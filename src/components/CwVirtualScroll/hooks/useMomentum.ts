import { useCallback, useEffect, useRef } from 'react'

export interface CwVirtualScrollMomentumState {
  isActive: boolean
  velocityY: number
  velocityX: number
}

export interface UpdateScrollPositionDirect {
  (top: number, left: number, callback?: () => void):
    | void
    | { clampedTop: number; clampedLeft: number }
}

export interface UseMomentumOptions {
  getScroll: () => { scrollTop: number; scrollLeft: number }
  direction: 'vertical' | 'horizontal' | 'both'
  momentumDeceleration: number
  updateScrollPositionDirect: UpdateScrollPositionDirect
  disabled?: boolean
  readonly?: boolean
}

/**
 * 惯性滚动 Hook（React 版）
 * 支持可选的边界检查和禁用状态检查
 */
export function useMomentum(options: UseMomentumOptions) {
  const optionsRef = useRef(options)
  const momentumStateRef = useRef<CwVirtualScrollMomentumState>({
    isActive: false,
    velocityY: 0,
    velocityX: 0,
  })
  const momentumRafIdRef = useRef<number | null>(null)

  useEffect(() => {
    optionsRef.current = options
  })

  const stopMomentum = useCallback(() => {
    if (momentumRafIdRef.current !== null) {
      cancelAnimationFrame(momentumRafIdRef.current)
      momentumRafIdRef.current = null
    }
    momentumStateRef.current = {
      isActive: false,
      velocityY: 0,
      velocityX: 0,
    }
  }, [])

  const startMomentum = useCallback(
    (velocityY: number, velocityX: number) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return

      const minVelocity = 0.5
      if (Math.abs(velocityY) < minVelocity && Math.abs(velocityX) < minVelocity) {
        return
      }

      momentumStateRef.current = {
        isActive: true,
        velocityY,
        velocityX,
      }

      const animateMomentum = () => {
        if (!momentumStateRef.current.isActive) {
          momentumRafIdRef.current = null
          return
        }

        let nextVelocityY = momentumStateRef.current.velocityY
        let nextVelocityX = momentumStateRef.current.velocityX

        nextVelocityY *= optionsRef.current.momentumDeceleration
        nextVelocityX *= optionsRef.current.momentumDeceleration

        const { scrollTop, scrollLeft } = optionsRef.current.getScroll()
        const direction = optionsRef.current.direction

        let newScrollTop = scrollTop
        let newScrollLeft = scrollLeft

        if (direction === 'horizontal') {
          newScrollLeft = scrollLeft + nextVelocityX
          newScrollTop = scrollTop
        } else if (direction === 'both') {
          newScrollTop = scrollTop + nextVelocityY
          newScrollLeft = scrollLeft + nextVelocityX
        } else {
          newScrollTop = scrollTop + nextVelocityY
          newScrollLeft = scrollLeft
        }

        const result = optionsRef.current.updateScrollPositionDirect(newScrollTop, newScrollLeft)

        momentumStateRef.current.velocityY = nextVelocityY
        momentumStateRef.current.velocityX = nextVelocityX

        if (Math.abs(nextVelocityY) < 0.1 && Math.abs(nextVelocityX) < 0.1) {
          stopMomentum()
          return
        }

        // 如果 updateScrollPositionDirect 返回了边界值，检查是否需要停止
        if (result && typeof result === 'object' && 'clampedTop' in result) {
          const { clampedTop, clampedLeft } = result
          if (clampedTop !== newScrollTop || clampedLeft !== newScrollLeft) {
            stopMomentum()
            return
          }
        }

        momentumRafIdRef.current = requestAnimationFrame(animateMomentum)
      }

      if (momentumRafIdRef.current === null) {
        momentumRafIdRef.current = requestAnimationFrame(animateMomentum)
      }
    },
    [stopMomentum],
  )

  useEffect(() => stopMomentum, [stopMomentum])

  return {
    momentumState: momentumStateRef.current,
    startMomentum,
    stopMomentum,
  }
}
