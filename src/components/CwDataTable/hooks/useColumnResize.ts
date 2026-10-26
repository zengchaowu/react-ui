import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react'
import type { CwDataTableColumn } from '../types'
import {
  calculateColumnWidth,
  getHorizontalScrollMetrics,
  pinHorizontalScrollToRight,
  resolveResizeTargetAt,
  resizeHandleId as toResizeHandleId,
} from '../functions'
import type { CwDataTableResizeEdge } from '../functions'

interface ResizeSession {
  column: CwDataTableColumn
  edge: CwDataTableResizeEdge
  startX: number
  startWidth: number
  pinScrollRight: boolean
  captureEl: HTMLElement | null
  pointerId: number | null
}

export interface UseColumnResizeOptions {
  resizable: boolean
  headerRef: RefObject<HTMLDivElement | null>
  bodyElRef: RefObject<HTMLElement | null>
  visibleColumnsRef: MutableRefObject<CwDataTableColumn[]>
  columnWidthsRef: MutableRefObject<Record<string, number>>
  setColumnWidths: (next: Record<string, number>) => void
  isResizingRef: MutableRefObject<boolean>
  flushExpandFillUpdate: () => void
  onColumnResizing?: (column: CwDataTableColumn, width: number) => void
  onColumnResize?: (column: CwDataTableColumn, width: number) => void
}

/** 表头列宽拖拽：pointer 会话、手柄显隐与悬停态 */
export function useColumnResize(options: UseColumnResizeOptions) {
  const { resizable, headerRef, bodyElRef, visibleColumnsRef, columnWidthsRef, setColumnWidths } =
    options
  const isResizingRef = options.isResizingRef
  const flushExpandFillUpdate = options.flushExpandFillUpdate

  const [activeResizeHandleId, setActiveResizeHandleId] = useState<string | null>(null)
  const [, setIsResizing] = useState(false)
  const resizeSessionRef = useRef<ResizeSession | null>(null)
  const pinScrollRafRef = useRef(0)

  const onColumnResizeRef = useRef(options.onColumnResize)
  onColumnResizeRef.current = options.onColumnResize
  const onColumnResizingRef = useRef(options.onColumnResizing)
  onColumnResizingRef.current = options.onColumnResizing

  const setDraggingChrome = useCallback((active: boolean) => {
    document.body.style.cursor = active ? 'col-resize' : ''
    document.body.style.userSelect = active ? 'none' : ''
  }, [])

  const pinScrollBarsToRight = useCallback(() => {
    pinHorizontalScrollToRight(headerRef.current)
    pinHorizontalScrollToRight(bodyElRef.current)
  }, [bodyElRef, headerRef])

  const schedulePinScrollRight = useCallback(() => {
    if (!resizeSessionRef.current?.pinScrollRight) return
    if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
    pinScrollRafRef.current = requestAnimationFrame(() => {
      pinScrollRafRef.current = 0
      pinScrollBarsToRight()
    })
  }, [pinScrollBarsToRight])

  const afterWidthCommitted = useCallback(
    (pinRight: boolean) => {
      flushExpandFillUpdate()
      if (!pinRight) return
      requestAnimationFrame(() => schedulePinScrollRight())
    },
    [flushExpandFillUpdate, schedulePinScrollRight],
  )

  const resolveStartWidth = useCallback(
    (column: CwDataTableColumn, handleEl: HTMLElement | null): number => {
      const stored = columnWidthsRef.current[column.key]
      if (stored != null && Number.isFinite(stored) && stored > 0) return stored
      if (column.width != null && column.width > 0) return column.width

      const rowEl = handleEl?.parentElement?.parentElement
      const cellEl =
        (rowEl?.querySelector(
          `[data-cw-dt-col="${CSS.escape(column.key)}"]`,
        ) as HTMLElement | null) ?? handleEl?.parentElement
      const w = cellEl?.getBoundingClientRect().width
      return w != null && Number.isFinite(w) && w > 0 ? w : 100
    },
    [columnWidthsRef],
  )

  const detachListeners = useCallback(() => {
    window.removeEventListener('pointermove', onPointerMoveRef.current)
    window.removeEventListener('pointerup', endResizeRef.current)
    window.removeEventListener('pointercancel', endResizeRef.current)
    window.removeEventListener('blur', endResizeRef.current)

    const session = resizeSessionRef.current
    const el = session?.captureEl
    const id = session?.pointerId
    if (el) {
      el.removeEventListener('lostpointercapture', endResizeRef.current)
      if (id != null && el.hasPointerCapture?.(id)) {
        try {
          el.releasePointerCapture(id)
        } catch {
          /* already released */
        }
      }
    }
  }, [])

  const onPointerMoveRef = useRef<(event: PointerEvent) => void>(() => {})
  const endResizeRef = useRef<() => void>(() => {})

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const session = resizeSessionRef.current
      if (!session) return
      const deltaX = event.clientX - session.startX
      const signedDelta = session.edge === 'start' ? -deltaX : deltaX
      const width = calculateColumnWidth(
        session.startWidth,
        signedDelta,
        session.column.minWidth,
        session.column.maxWidth,
      )
      setColumnWidths({
        ...columnWidthsRef.current,
        [session.column.key]: width,
      })
      onColumnResizingRef.current?.(session.column, width)
      afterWidthCommitted(session.pinScrollRight)
    },
    [columnWidthsRef, setColumnWidths, afterWidthCommitted],
  )
  onPointerMoveRef.current = onPointerMove

  const endResize = useCallback(() => {
    if (!isResizingRef.current && !resizeSessionRef.current) return
    const active = resizeSessionRef.current
    if (active) {
      onColumnResizeRef.current?.(
        active.column,
        columnWidthsRef.current[active.column.key] ?? active.column.width ?? 100,
      )
    }

    const shouldPin = active?.pinScrollRight ?? false
    setDraggingChrome(false)
    detachListeners()
    resizeSessionRef.current = null
    isResizingRef.current = false
    setIsResizing(false)
    setActiveResizeHandleId(null)

    flushExpandFillUpdate()
    if (shouldPin) {
      requestAnimationFrame(() => {
        if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
        pinScrollRafRef.current = requestAnimationFrame(() => {
          pinScrollRafRef.current = 0
          pinScrollBarsToRight()
        })
      })
    }
  }, [
    bodyElRef,
    columnWidthsRef,
    detachListeners,
    flushExpandFillUpdate,
    isResizingRef,
    pinScrollBarsToRight,
    setDraggingChrome,
  ])
  endResizeRef.current = endResize

  const beginResize = useCallback(
    (input: {
      column: CwDataTableColumn
      edge: CwDataTableResizeEdge
      handleId: string
      event: PointerEvent
      handleEl: HTMLElement | null
    }) => {
      const { column, edge, handleId, event, handleEl } = input
      if (column.resizable === false || !resizable || event.button !== 0) return

      const scrollRoot = bodyElRef.current ?? headerRef.current
      resizeSessionRef.current = {
        column,
        edge,
        startX: event.clientX,
        startWidth: resolveStartWidth(column, handleEl),
        pinScrollRight: getHorizontalScrollMetrics(scrollRoot).atRightEnd,
        captureEl: handleEl,
        pointerId: null,
      }
      isResizingRef.current = true
      setIsResizing(true)
      setActiveResizeHandleId(handleId)
      setDraggingChrome(true)

      const session = resizeSessionRef.current
      const el = session.captureEl
      if (el && typeof event.pointerId === 'number' && el.setPointerCapture) {
        try {
          el.setPointerCapture(event.pointerId)
          session.pointerId = event.pointerId
          el.addEventListener('lostpointercapture', endResizeRef.current)
        } catch {
          session.pointerId = null
        }
      }

      window.addEventListener('pointermove', onPointerMoveRef.current)
      window.addEventListener('pointerup', endResizeRef.current)
      window.addEventListener('pointercancel', endResizeRef.current)
      window.addEventListener('blur', endResizeRef.current)

      event.preventDefault()
      event.stopPropagation()
    },
    [bodyElRef, headerRef, isResizingRef, resizable, resolveStartWidth, setDraggingChrome],
  )

  useEffect(() => {
    return () => {
      if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
      detachListeners()
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      resizeSessionRef.current = null
    }
  }, [detachListeners])

  const resolveHandleTarget = useCallback(
    (colIndex: number, side: CwDataTableResizeEdge) => {
      if (!resizable) return null
      return resolveResizeTargetAt(
        visibleColumnsRef.current,
        colIndex,
        side,
        getHorizontalScrollMetrics(headerRef.current ?? bodyElRef.current),
      )
    },
    [bodyElRef, headerRef, resizable, visibleColumnsRef],
  )

  const canShowResizeHandle = useCallback(
    (colIndex: number, side: CwDataTableResizeEdge) =>
      resolveHandleTarget(colIndex, side) != null,
    [resolveHandleTarget],
  )

  const onResizeHandlePointerDown = useCallback(
    (
      colIndex: number,
      side: CwDataTableResizeEdge,
      event: ReactPointerEvent<HTMLDivElement>,
    ) => {
      const target = resolveHandleTarget(colIndex, side)
      if (target) {
        beginResize({
          ...target,
          event: event.nativeEvent,
          handleEl: event.currentTarget,
        })
      }
    },
    [beginResize, resolveHandleTarget],
  )

  const handleResizeMouseEnter = useCallback((handleIdValue: string) => {
    if (!isResizingRef.current) setActiveResizeHandleId(handleIdValue)
  }, [isResizingRef])

  const handleResizeMouseLeave = useCallback(() => {
    if (!isResizingRef.current) setActiveResizeHandleId(null)
  }, [isResizingRef])

  return {
    activeResizeHandleId,
    canShowResizeHandle,
    onResizeHandlePointerDown,
    handleResizeMouseEnter,
    handleResizeMouseLeave,
  }
}
