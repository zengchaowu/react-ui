import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { calculateItemPositions } from '@zengchaowu/ui-shared/components/CwSwiper/functions/calculateItemPositions'
import { calculateItemScale } from '@zengchaowu/ui-shared/components/CwSwiper/functions/calculateItemScale'

const CALM_FRAMES = 2

/**
 * 按卡片中心缩放。拖拽和吸附动画期间持续量，位置停稳两帧后结束。
 * 不走 CSS transition，轻微滑动时缩放会跟着手。
 */
export function useItemScales(
  containerRef: RefObject<HTMLElement | null>,
  minScale: number,
) {
  const [itemScales, setItemScales] = useState<Record<number, number>>({})
  const scalesRef = useRef<Record<number, number>>({})
  const minScaleRef = useRef(minScale)
  const rafIdRef = useRef(0)
  const activeRef = useRef(true)
  const calmRef = useRef(0)
  const lastKeyRef = useRef('')

  minScaleRef.current = minScale

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return ''

    const rect = container.getBoundingClientRect()
    if (rect.width <= 0) return ''

    const containerCenter = rect.left + rect.width / 2
    const positions = calculateItemPositions(container, containerCenter)
    const seen = new Set<number>()
    const current = scalesRef.current
    let changed = false

    for (const { index, center } of positions) {
      seen.add(index)
      const scale = calculateItemScale(
        Math.abs(center - containerCenter),
        rect.width / 2,
        minScaleRef.current,
      )
      if (Math.abs((current[index] ?? minScaleRef.current) - scale) > 0.001) {
        current[index] = scale
        changed = true
      }
    }

    for (const key of Object.keys(current)) {
      const index = Number(key)
      if (!seen.has(index)) {
        delete current[index]
        changed = true
      }
    }

    if (changed) {
      setItemScales({ ...current })
    }

    return positions.map((item) => `${item.index}:${Math.round(item.center)}`).join('|')
  }, [containerRef])

  const tick = useCallback(() => {
    rafIdRef.current = 0
    if (!activeRef.current) return

    const key = measure()
    calmRef.current = key === lastKeyRef.current ? calmRef.current + 1 : 0
    lastKeyRef.current = key
    if (calmRef.current < CALM_FRAMES && !rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(tick)
    }
  }, [measure])

  const scheduleScaleUpdate = useCallback(() => {
    calmRef.current = 0
    if (!activeRef.current || rafIdRef.current) return
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

  useEffect(() => {
    scheduleScaleUpdate()
  }, [minScale, scheduleScaleUpdate])

  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
      if (!rafIdRef.current) return
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }
  }, [])

  const getItemStyle = useCallback(
    (index: number): CSSProperties => ({
      transform: `scale(${itemScales[index] ?? minScale})`,
      transformOrigin: 'center center',
    }),
    [itemScales, minScale],
  )

  const getItemScale = useCallback(
    (index: number) => itemScales[index] ?? minScale,
    [itemScales, minScale],
  )

  return { scheduleScaleUpdate, getItemStyle, getItemScale }
}
