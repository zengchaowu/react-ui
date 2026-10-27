import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { CwDataTableColumn } from '../types'
import { computeShouldExpandFillColumns } from '../functions'

export interface UseExpandFillColumnsOptions {
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  visibleColumns: CwDataTableColumn[]
  visibleColumnsRef: MutableRefObject<CwDataTableColumn[]>
  columnWidths: Record<string, number>
  columnWidthsRef: MutableRefObject<Record<string, number>>
  /** 首帧是否假定可吃满容器，避免弹性列 width:auto 塌缩 */
  initialExpandFill?: boolean
  /** 每次重算后可同步执行的收尾（如 CwDiv 重新测量） */
  onAfterUpdate?: () => void
}

/**
 * 根据表体可视宽度与各列自然宽度，决定是否启用 fill/弹性列吃剩余空间。
 */
export function useExpandFillColumns(options: UseExpandFillColumnsOptions) {
  const { bodyEl, bodyElRef, visibleColumns, visibleColumnsRef, columnWidths, columnWidthsRef } =
    options

  const [expandFillColumns, setExpandFillColumns] = useState(
    options.initialExpandFill === true,
  )
  const expandFillColumnsRef = useRef(expandFillColumns)
  expandFillColumnsRef.current = expandFillColumns

  /** 表体可视宽度，供列宽把剩余空间按比例摊开 */
  const [layoutContainerWidth, setLayoutContainerWidth] = useState(0)

  const expandFillRafRef = useRef(0)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const updateExpandFillLayout = useCallback(() => {
    const width = bodyElRef.current?.clientWidth ?? 0
    setLayoutContainerWidth((prev) => (Math.abs(prev - width) >= 0.5 ? width : prev))
    const next = computeShouldExpandFillColumns(
      visibleColumnsRef.current,
      columnWidthsRef.current,
      bodyElRef.current,
    )
    setExpandFillColumns((prev) => (next === prev ? prev : next))
    optionsRef.current.onAfterUpdate?.()
  }, [bodyElRef, columnWidthsRef, visibleColumnsRef])

  const scheduleExpandFillUpdate = useCallback(() => {
    if (expandFillRafRef.current) cancelAnimationFrame(expandFillRafRef.current)
    expandFillRafRef.current = requestAnimationFrame(() => {
      expandFillRafRef.current = 0
      updateExpandFillLayout()
    })
  }, [updateExpandFillLayout])

  /** 拖拽列宽等需要立刻反映横滚/fill 时同步刷新（取消已排队的 rAF） */
  const flushExpandFillUpdate = useCallback(() => {
    if (expandFillRafRef.current) {
      cancelAnimationFrame(expandFillRafRef.current)
      expandFillRafRef.current = 0
    }
    updateExpandFillLayout()
  }, [updateExpandFillLayout])

  useLayoutEffect(() => {
    if (!bodyEl) return
    // 首帧前同步量一次表体宽度：剩余空间分摊必须赶在第一次绘制前生效，
    // 否则会先画出未分摊的列宽再跳一次（Vue 版在绘制前就完成了）。
    flushExpandFillUpdate()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => scheduleExpandFillUpdate())
    observer.observe(bodyEl)
    return () => observer.disconnect()
  }, [bodyEl, flushExpandFillUpdate, scheduleExpandFillUpdate])

  useEffect(() => {
    scheduleExpandFillUpdate()
  }, [visibleColumns, columnWidths, scheduleExpandFillUpdate])

  useEffect(() => {
    return () => {
      if (expandFillRafRef.current) cancelAnimationFrame(expandFillRafRef.current)
    }
  }, [])

  return {
    expandFillColumns,
    expandFillColumnsRef,
    layoutContainerWidth,
    scheduleExpandFillUpdate,
    flushExpandFillUpdate,
  }
}
