import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  MAX_FLOW_ZOOM,
  MIN_FLOW_ZOOM,
  buildFitViewport,
  getNodesBounds,
  screenToWorld,
} from '@zengchaowu/ui-shared/components/CwFlow/geometry'
import { applyPan, applyZoomAt } from '@zengchaowu/ui-shared/components/CwFlow/interaction'
import type {
  CwFlowNode,
  CwFlowPoint,
  CwFlowSize,
  CwFlowViewport,
} from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 视口能力入参 */
export interface CwFlowViewportOptions {
  rootRef: RefObject<HTMLElement | null>
  minZoom: number
  maxZoom: number
}

/** 视口平移 / 缩放 / 适应画布 */
export function useCwFlowViewport(options: CwFlowViewportOptions) {
  const [viewport, setViewport] = useState<CwFlowViewport>({ x: 0, y: 0, zoom: 1 })
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport
  const panHandlersRef = useRef<{ move?: (event: PointerEvent) => void; up?: () => void }>({})

  const getContainerSize = useCallback((): CwFlowSize => {
    const element = options.rootRef.current
    return { width: element?.clientWidth ?? 0, height: element?.clientHeight ?? 0 }
  }, [options.rootRef])

  const getLocalPoint = useCallback(
    (event: { clientX: number; clientY: number }): CwFlowPoint => {
      const rect = options.rootRef.current?.getBoundingClientRect()
      return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
    },
    [options.rootRef],
  )

  const graphStyle = useMemo(
    () => ({
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    }),
    [viewport],
  )

  const zoomAt = useCallback(
    (pointer: CwFlowPoint, factor: number) => {
      setViewport((current) =>
        applyZoomAt(current, pointer, factor, options.minZoom ?? MIN_FLOW_ZOOM, options.maxZoom ?? MAX_FLOW_ZOOM),
      )
    },
    [options.minZoom, options.maxZoom],
  )

  const zoomIn = useCallback(() => {
    const size = getContainerSize()
    zoomAt({ x: size.width / 2, y: size.height / 2 }, 1.2)
  }, [getContainerSize, zoomAt])

  const zoomOut = useCallback(() => {
    const size = getContainerSize()
    zoomAt({ x: size.width / 2, y: size.height / 2 }, 1 / 1.2)
  }, [getContainerSize, zoomAt])

  const fitView = useCallback(
    (nodes: CwFlowNode[], sizes: Record<string, CwFlowSize>) => {
      const container = getContainerSize()
      if (container.width <= 0 || container.height <= 0) return
      setViewport(buildFitViewport(getNodesBounds(nodes, sizes), container))
    },
    [getContainerSize],
  )

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 })
  }, [])

  const wheelZoom = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      zoomAt(getLocalPoint(event), Math.exp(-event.deltaY * 0.0015))
    },
    [getLocalPoint, zoomAt],
  )

  const endPan = useCallback(() => {
    const handlers = panHandlersRef.current
    if (handlers.move) window.removeEventListener('pointermove', handlers.move)
    if (handlers.up) window.removeEventListener('pointerup', handlers.up)
    panHandlersRef.current = {}
  }, [])

  const startPan = useCallback(
    (event: { clientX: number; clientY: number }) => {
      let last = getLocalPoint(event)
      const move = (moveEvent: PointerEvent) => {
        const current = getLocalPoint(moveEvent)
        const delta = { x: current.x - last.x, y: current.y - last.y }
        last = current
        setViewport((previous) => applyPan(previous, delta))
      }
      const up = () => endPan()
      panHandlersRef.current = { move, up }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [getLocalPoint, endPan],
  )

  useEffect(() => endPan, [endPan])

  return {
    viewport,
    viewportRef,
    graphStyle,
    getContainerSize,
    getLocalPoint,
    screenToWorld: (point: CwFlowPoint) => screenToWorld(point, viewportRef.current),
    zoomAt,
    zoomIn,
    zoomOut,
    fitView,
    resetView,
    wheelZoom,
    startPan,
    endPan,
  }
}
