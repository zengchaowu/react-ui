import { useCallback, useEffect, useRef } from 'react'

/**
 * 惯性滚动 Hook
 */
export function useMomentum(options: {
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  direction: 'vertical' | 'horizontal' | 'both'
  momentumDeceleration: number
  updateScrollPositionDirect: (top: number, left: number) => void
  onFrame: () => void
  disabled: boolean
  readonly: boolean
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const stateRef = useRef({
    isActive: false,
    velocityY: 0,
    velocityX: 0,
  })
  const momentumRafRef = useRef<number | null>(null)

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current !== null) {
      cancelAnimationFrame(momentumRafRef.current)
      momentumRafRef.current = null
    }
    stateRef.current = {
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

      stateRef.current = {
        isActive: true,
        velocityY,
        velocityX,
      }

      const animateMomentum = () => {
        const latest = optionsRef.current
        const state = stateRef.current
        if (!state.isActive) {
          momentumRafRef.current = null
          return
        }

        const nextVelocityY = state.velocityY * latest.momentumDeceleration
        const nextVelocityX = state.velocityX * latest.momentumDeceleration

        let newScrollTop = latest.scrollTopRef.current
        let newScrollLeft = latest.scrollLeftRef.current

        if (latest.direction === 'horizontal') {
          newScrollLeft = latest.scrollLeftRef.current + nextVelocityX
          newScrollTop = latest.scrollTopRef.current
        } else if (latest.direction === 'both') {
          newScrollTop = latest.scrollTopRef.current + nextVelocityY
          newScrollLeft = latest.scrollLeftRef.current + nextVelocityX
        } else {
          newScrollTop = latest.scrollTopRef.current + nextVelocityY
          newScrollLeft = latest.scrollLeftRef.current
        }

        latest.updateScrollPositionDirect(newScrollTop, newScrollLeft)
        latest.onFrame()

        state.velocityY = nextVelocityY
        state.velocityX = nextVelocityX

        if (Math.abs(nextVelocityY) < 0.1 && Math.abs(nextVelocityX) < 0.1) {
          stopMomentum()
          return
        }

        momentumRafRef.current = requestAnimationFrame(animateMomentum)
      }

      if (momentumRafRef.current === null) {
        momentumRafRef.current = requestAnimationFrame(animateMomentum)
      }
    },
    [stopMomentum],
  )

  useEffect(() => stopMomentum, [stopMomentum])

  return {
    startMomentum,
    stopMomentum,
  }
}
