import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'
import { getNodeRect } from '@zengchaowu/ui-shared/components/CwFlow/geometry'
import { applyNodeDelta } from '@zengchaowu/ui-shared/components/CwFlow/interaction'
import type {
  CwFlowNode,
  CwFlowNodeChange,
  CwFlowPoint,
  CwFlowRect,
  CwFlowSize,
  CwFlowViewport,
} from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 节点布局 / 测量 / 拖拽 / 选择入参 */
export interface CwFlowNodesOptions {
  nodes: CwFlowNode[]
  disabled: boolean
  viewportRef: MutableRefObject<CwFlowViewport>
  rootRef: RefObject<HTMLElement | null>
  onNodesChange?: (changes: CwFlowNodeChange[]) => void
  onNodeClick?: (node: CwFlowNode, event: MouseEvent) => void
}

const DRAG_THRESHOLD = 4

interface DragState {
  id: string
  startLocal: CwFlowPoint
  startPositions: Record<string, CwFlowPoint>
  moved: boolean
}

/** 节点位置同步、尺寸测量、拖拽与选择 */
export function useCwFlowNodes(options: CwFlowNodesOptions) {
  const [positions, setPositions] = useState<Record<string, CwFlowPoint>>({})
  const [sizes, setSizes] = useState<Record<string, CwFlowSize>>({})
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})

  const positionsRef = useRef(positions)
  positionsRef.current = positions
  const sizesRef = useRef(sizes)
  sizesRef.current = sizes
  const selectedRef = useRef(selectedIds)
  selectedRef.current = selectedIds
  const disabledRef = useRef(options.disabled)
  disabledRef.current = options.disabled
  const nodesRef = useRef(options.nodes)
  nodesRef.current = options.nodes
  const callbacksRef = useRef({
    onNodesChange: options.onNodesChange,
    onNodeClick: options.onNodeClick,
  })
  callbacksRef.current = {
    onNodesChange: options.onNodesChange,
    onNodeClick: options.onNodeClick,
  }

  const dragRef = useRef<DragState | null>(null)
  const dragHandlersRef = useRef<{ move?: (event: PointerEvent) => void; up?: (event: PointerEvent) => void }>({})
  const observedRef = useRef(new Map<Element, ResizeObserver>())

  useEffect(() => {
    setPositions((previous) => {
      const next: Record<string, CwFlowPoint> = {}
      for (const node of options.nodes) {
        const dragging = dragRef.current?.startPositions[node.id] !== undefined
        next[node.id] = dragging ? previous[node.id] ?? node.position : { ...node.position }
      }
      return next
    })
    const nextSelected: Record<string, boolean> = {}
    for (const node of options.nodes) nextSelected[node.id] = node.selected === true
    setSelectedIds(nextSelected)
  }, [options.nodes])

  const localPoint = useCallback(
    (event: { clientX: number; clientY: number }): CwFlowPoint => {
      const rect = options.rootRef.current?.getBoundingClientRect()
      return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
    },
    [options.rootRef],
  )

  const emitChanges = useCallback((changes: CwFlowNodeChange[]) => {
    if (changes.length > 0) callbacksRef.current.onNodesChange?.(changes)
  }, [])

  const selectNode = useCallback(
    (id: string, additive: boolean) => {
      const current = selectedRef.current
      const next: Record<string, boolean> = { ...current }
      const changes: CwFlowNodeChange[] = []
      if (additive) {
        const value = !current[id]
        next[id] = value
        changes.push({ type: 'select', id, selected: value })
      } else {
        for (const key of Object.keys(current)) {
          if (key !== id && current[key]) {
            next[key] = false
            changes.push({ type: 'select', id: key, selected: false })
          }
        }
        if (!current[id]) {
          next[id] = true
          changes.push({ type: 'select', id, selected: true })
        }
      }
      selectedRef.current = next
      setSelectedIds(next)
      emitChanges(changes)
    },
    [emitChanges],
  )

  const clearNodeSelection = useCallback(() => {
    const current = selectedRef.current
    const changes: CwFlowNodeChange[] = []
    const next: Record<string, boolean> = { ...current }
    for (const key of Object.keys(current)) {
      if (current[key]) {
        next[key] = false
        changes.push({ type: 'select', id: key, selected: false })
      }
    }
    selectedRef.current = next
    setSelectedIds(next)
    emitChanges(changes)
  }, [emitChanges])

  const selectedNodeIds = useMemo(
    () => Object.keys(selectedIds).filter((id) => selectedIds[id]),
    [selectedIds],
  )

  const removeSelectedNodes = useCallback(() => {
    const ids = selectedNodeIds
    if (ids.length === 0) return
    callbacksRef.current.onNodesChange?.(ids.map((id) => ({ type: 'remove' as const, id })))
    const next = { ...selectedRef.current }
    for (const id of ids) delete next[id]
    selectedRef.current = next
    setSelectedIds(next)
  }, [selectedNodeIds])

  const bindNodeElement = useCallback((id: string, element: unknown) => {
    if (!(element instanceof Element) || observedRef.current.has(element)) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = { width: entry.contentRect.width, height: entry.contentRect.height }
        if (size.width <= 0 || size.height <= 0) continue
        const cached = sizesRef.current[id]
        if (cached && cached.width === size.width && cached.height === size.height) continue
        sizesRef.current = { ...sizesRef.current, [id]: size }
        setSizes(sizesRef.current)
        callbacksRef.current.onNodesChange?.([{ type: 'dimensions', id, dimensions: size }])
      }
    })
    observer.observe(element)
    observedRef.current.set(element, observer)
  }, [])

  const startNodeDrag = useCallback(
    (id: string, event: { clientX: number; clientY: number }) => {
      const node = nodesRef.current.find((item) => item.id === id)
      if (!node) return
      const state: DragState = {
        id,
        startLocal: localPoint(event),
        startPositions: { [id]: { ...(positionsRef.current[id] ?? node.position) } },
        moved: false,
      }
      dragRef.current = state

      const move = (moveEvent: PointerEvent) => {
        const current = localPoint(moveEvent)
        const dx = current.x - state.startLocal.x
        const dy = current.y - state.startLocal.y
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        state.moved = true
        const currentNode = nodesRef.current.find((item) => item.id === state.id)
        if (disabledRef.current || currentNode?.draggable === false) return
        const zoom = options.viewportRef.current.zoom
        const next = applyNodeDelta(state.startPositions, [state.id], { x: dx / zoom, y: dy / zoom })
        setPositions(next)
        emitChanges([{ type: 'position', id: state.id, position: next[state.id] }])
      }

      const up = (upEvent: PointerEvent) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        dragHandlersRef.current = {}
        dragRef.current = null
        if (state.moved) return
        const currentNode = nodesRef.current.find((item) => item.id === state.id)
        if (!currentNode) return
        if (!disabledRef.current) {
          selectNode(state.id, upEvent.ctrlKey || upEvent.metaKey || upEvent.shiftKey || upEvent.altKey)
        }
        callbacksRef.current.onNodeClick?.(currentNode, upEvent)
      }

      dragHandlersRef.current = { move, up }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [emitChanges, localPoint, options.viewportRef, selectNode],
  )

  useEffect(() => {
    const observed = observedRef.current
    return () => {
      observed.forEach((observer) => observer.disconnect())
      observed.clear()
      const handlers = dragHandlersRef.current
      if (handlers.move) window.removeEventListener('pointermove', handlers.move)
      if (handlers.up) window.removeEventListener('pointerup', handlers.up)
    }
  }, [])

  const placedNodes = useMemo<CwFlowNode[]>(
    () =>
      options.nodes.map((node) => ({
        ...node,
        position: positions[node.id] ?? node.position,
      })),
    [options.nodes, positions],
  )

  const nodeItems = useMemo(
    () =>
      placedNodes.map((node) => ({
        node,
        rect: getNodeRect(node, sizes[node.id]),
      })),
    [placedNodes, sizes],
  )

  const nodeRectsById = useMemo(() => {
    const map: Record<string, CwFlowRect> = {}
    for (const item of nodeItems) map[item.node.id] = item.rect
    return map
  }, [nodeItems])

  const isNodeSelected = useCallback((id: string) => selectedIds[id] === true, [selectedIds])

  return {
    positions,
    sizes,
    placedNodes,
    nodeItems,
    nodeRectsById,
    selectedNodeIds,
    isNodeSelected,
    bindNodeElement,
    selectNode,
    clearNodeSelection,
    removeSelectedNodes,
    startNodeDrag,
  }
}
