import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildEdgePath,
  getEdgeAnchors,
  getMinimapNodeRects,
  getMinimapViewportRect,
  getNodesBounds,
  MAX_FLOW_ZOOM,
  MIN_FLOW_ZOOM,
} from '@zengchaowu/ui-shared/components/CwFlow/geometry'
import {
  flowArrow,
  flowBackgroundStyle,
  flowBase,
  flowHandles,
} from '@zengchaowu/ui-shared/components/CwFlow/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwFlow/texts'
import type {
  CwFlowEdge,
  CwFlowEdgeChange,
  CwFlowNode,
  CwFlowNodeChange,
} from '@zengchaowu/ui-shared/components/CwFlow/types'
import { defaultCwFlowNodeTypes } from './nodes'
import type { CwFlowProps } from './types'
import { useCwFlowConnect } from './useCwFlowConnect'
import { useCwFlowKeyboard } from './useCwFlowKeyboard'
import { useCwFlowNodes } from './useCwFlowNodes'
import { useCwFlowViewport } from './useCwFlowViewport'

let markerSequence = 0

/** 自研流程图组件（react 版） */
export function CwFlow({
  nodes: flowNodes,
  edges,
  nodeTypes,
  showMinimap = false,
  showControls = true,
  showBackground = true,
  disabled = false,
  fitViewOnInit = true,
  minZoom = MIN_FLOW_ZOOM,
  maxZoom = MAX_FLOW_ZOOM,
  texts,
  className,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
}: CwFlowProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const markerIdRef = useRef('')
  if (!markerIdRef.current) {
    markerSequence += 1
    markerIdRef.current = `cw-flow-arrow-${markerSequence}`
  }

  const labels = useMemo(() => ({ ...defaultTexts, ...(texts ?? {}) }), [texts])
  const nodeTypesMap = useMemo(
    () => ({ ...defaultCwFlowNodeTypes, ...(nodeTypes ?? {}) }),
    [nodeTypes],
  )

  const viewportApi = useCwFlowViewport({ rootRef, minZoom, maxZoom })
  const nodesApi = useCwFlowNodes({
    nodes: flowNodes,
    disabled,
    viewportRef: viewportApi.viewportRef,
    rootRef,
    onNodesChange,
    onNodeClick,
  })

  const [selectedEdges, setSelectedEdges] = useState<Record<string, boolean>>({})
  const selectedEdgesRef = useRef(selectedEdges)
  selectedEdgesRef.current = selectedEdges

  const emitEdges = useCallback(
    (changes: CwFlowEdgeChange[]) => {
      if (changes.length > 0) onEdgesChange?.(changes)
    },
    [onEdgesChange],
  )

  const clearEdgeSelection = useCallback(() => {
    const current = selectedEdgesRef.current
    const changes: CwFlowEdgeChange[] = []
    const next = { ...current }
    for (const id of Object.keys(current)) {
      if (current[id]) {
        next[id] = false
        changes.push({ type: 'select', id, selected: false })
      }
    }
    selectedEdgesRef.current = next
    setSelectedEdges(next)
    emitEdges(changes)
  }, [emitEdges])

  const handleEdgeClick = (edge: CwFlowEdge, event: React.MouseEvent) => {
    if (disabled) return
    event.stopPropagation()
    const additive = event.ctrlKey || event.metaKey || event.shiftKey
    if (!additive) nodesApi.clearNodeSelection()
    const changes: CwFlowEdgeChange[] = []
    const current = selectedEdgesRef.current
    if (!additive) {
      for (const id of Object.keys(current)) {
        if (id !== edge.id && current[id]) changes.push({ type: 'select', id, selected: false })
      }
    }
    const selected = additive ? !current[edge.id] : true
    const next: Record<string, boolean> = additive ? { ...current } : {}
    for (const id of Object.keys(current)) next[id] = id === edge.id ? selected : additive ? current[id] : false
    next[edge.id] = selected
    selectedEdgesRef.current = next
    setSelectedEdges(next)
    changes.push({ type: 'select', id: edge.id, selected })
    emitEdges(changes)
  }

  const connectApi = useCwFlowConnect({
    disabled,
    rootRef,
    viewportRef: viewportApi.viewportRef,
    getNodeRect: (id) => nodesApi.nodeRectsById[id] ?? null,
    onConnect,
  })

  const renderedEdges = useMemo(
    () =>
      edges.flatMap((edge) => {
        const source = nodesApi.nodeRectsById[edge.source]
        const target = nodesApi.nodeRectsById[edge.target]
        if (!source || !target) return []
        const anchors = getEdgeAnchors(source, target)
        return [
          {
            edge,
            path: buildEdgePath(anchors.start, anchors.end),
            labelX: (anchors.start.x + anchors.end.x) / 2,
            labelY: (anchors.start.y + anchors.end.y) / 2 - 4,
          },
        ]
      }),
    [edges, nodesApi.nodeRectsById],
  )

  const bounds = useMemo(
    () => getNodesBounds(nodesApi.placedNodes, nodesApi.sizes),
    [nodesApi.placedNodes, nodesApi.sizes],
  )
  const minimapNodes = useMemo(
    () => getMinimapNodeRects(nodesApi.placedNodes, nodesApi.sizes, bounds),
    [nodesApi.placedNodes, nodesApi.sizes, bounds],
  )
  const minimapViewport = useMemo(
    () => getMinimapViewportRect(viewportApi.viewport, viewportApi.getContainerSize(), bounds),
    [viewportApi.viewport, bounds, viewportApi],
  )

  const handleDelete = () => {
    const edgeIds = Object.keys(selectedEdgesRef.current).filter((id) => selectedEdgesRef.current[id])
    nodesApi.removeSelectedNodes()
    if (edgeIds.length > 0) {
      emitEdges(edgeIds.map((id) => ({ type: 'remove' as const, id })))
      const next = { ...selectedEdgesRef.current }
      for (const id of edgeIds) delete next[id]
      selectedEdgesRef.current = next
      setSelectedEdges(next)
    }
  }

  const handleKeydown = useCwFlowKeyboard({ disabled, onDelete: handleDelete })

  // 首次自动适应画布：等所有节点完成尺寸测量后再计算，避免用默认尺寸得到错误的缩放与偏移；
  // 只在第一次测量齐全时执行一次，之后由用户手动「适应画布」控制。
  const autoFitPendingRef = useRef(fitViewOnInit)
  const fitView = viewportApi.fitView
  useEffect(() => {
    if (!autoFitPendingRef.current) return
    const list = nodesApi.placedNodes
    if (list.length === 0) return
    const measured = list.every(
      (node) =>
        (node.width != null && node.height != null) || nodesApi.sizes[node.id] !== undefined,
    )
    if (!measured) return
    autoFitPendingRef.current = false
    fitView(list, nodesApi.sizes)
  }, [fitView, nodesApi.placedNodes, nodesApi.sizes])

  const wheelZoom = viewportApi.wheelZoom
  useEffect(() => {
    const element = rootRef.current
    if (!element) return
    const handler = (event: WheelEvent) => {
      if (disabled) return
      const target = event.target as Element | null
      if (target?.closest('[data-cw-flow-node]')) return
      wheelZoom(event)
    }
    element.addEventListener('wheel', handler, { passive: false })
    return () => element.removeEventListener('wheel', handler)
  }, [disabled, wheelZoom])

  const resolveNodeType = (node: CwFlowNode) =>
    nodeTypesMap[node.type ?? 'rectangle'] ?? defaultCwFlowNodeTypes.rectangle

  const handleRootPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const target = event.target as Element | null
    if (target?.closest('[data-cw-flow-node]')) return
    nodesApi.clearNodeSelection()
    clearEdgeSelection()
    viewportApi.startPan(event)
    rootRef.current?.focus()
  }

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null
    if (target?.closest('[data-cw-flow-node]')) return
    viewportApi.fitView(nodesApi.placedNodes, nodesApi.sizes)
  }

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={[flowBase.root, className].filter(Boolean).join(' ')}
      onPointerDown={handleRootPointerDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeydown}
    >
      {showBackground && (
        <div className={flowBase.background} style={flowBackgroundStyle} />
      )}

      <div className={flowBase.graph} style={viewportApi.graphStyle}>
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={1} height={1}>
          <defs>
            <marker id={markerIdRef.current} {...flowArrow.attrs}>
              <path d={flowArrow.path} className={flowArrow.pathClass} />
            </marker>
          </defs>

          {renderedEdges.map((item) => (
            <g key={item.edge.id}>
              <path
                d={item.path}
                className={[
                  flowBase.edge,
                  item.edge.selected ? flowBase.edgeActive : '',
                  'pointer-events-auto cursor-pointer',
                ]
                  .filter(Boolean)
                  .join(' ')}
                strokeWidth={2}
                strokeDasharray={item.edge.animated ? '6 4' : undefined}
                markerEnd={`url(#${markerIdRef.current})`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => handleEdgeClick(item.edge, event)}
              />
              {item.edge.label && (
                <text
                  x={item.labelX}
                  y={item.labelY}
                  className={flowBase.edgeLabel}
                  textAnchor="middle"
                >
                  {item.edge.label}
                </text>
              )}
            </g>
          ))}

          {connectApi.draftPath && (
            <path
              d={connectApi.draftPath}
              className={flowBase.edge}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {nodesApi.nodeItems.map((item) => {
          const NodeComponent = resolveNodeType(item.node)
          return (
            <div
              key={item.node.id}
              ref={(element) => nodesApi.bindNodeElement(item.node.id, element)}
              data-cw-flow-node={item.node.id}
              className={[
                flowBase.node,
                nodesApi.isNodeSelected(item.node.id) ? flowBase.nodeSelected : '',
                disabled ? flowBase.nodeDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ transform: `translate(${item.rect.x}px, ${item.rect.y}px)` }}
              onPointerDown={(event) => {
                event.stopPropagation()
                nodesApi.startNodeDrag(item.node.id, event)
              }}
            >
              <NodeComponent
                node={item.node}
                selected={nodesApi.isNodeSelected(item.node.id)}
                disabled={disabled}
              />
              {!disabled &&
                item.node.connectable !== false &&
                flowHandles.map((handle) => (
                  <div
                    key={handle.side}
                    data-cw-flow-handle={handle.side}
                    className={`${flowBase.handle} ${handle.className}`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      connectApi.startConnect(item.node.id, event, handle.side)
                    }}
                  />
                ))}
            </div>
          )
        })}
      </div>

      {showMinimap && (
        <div className={`${flowBase.minimap} pointer-events-none`}>
          {minimapNodes.map((rect) => (
            <div
              key={rect.id}
              className={flowBase.minimapNode}
              style={{
                left: `${rect.left}%`,
                top: `${rect.top}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
              }}
            />
          ))}
          <div
            className={flowBase.minimapViewport}
            style={{
              left: `${minimapViewport.left}%`,
              top: `${minimapViewport.top}%`,
              width: `${minimapViewport.width}%`,
              height: `${minimapViewport.height}%`,
            }}
          />
        </div>
      )}

      {showControls !== false && (
        <div className={flowBase.controls} onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" className={flowBase.controlButton} aria-label={labels.zoomIn} onClick={viewportApi.zoomIn}>
            {labels.zoomIn}
          </button>
          <button type="button" className={flowBase.controlButton} aria-label={labels.zoomOut} onClick={viewportApi.zoomOut}>
            {labels.zoomOut}
          </button>
          <button
            type="button"
            className={flowBase.controlButton}
            aria-label={labels.fitView}
            onClick={() => viewportApi.fitView(nodesApi.placedNodes, nodesApi.sizes)}
          >
            {labels.fitView}
          </button>
          <button type="button" className={flowBase.controlButton} aria-label={labels.resetView} onClick={viewportApi.resetView}>
            {labels.resetView}
          </button>
        </div>
      )}

      {flowNodes.length === 0 && <div className={flowBase.empty}>{labels.empty}</div>}
    </div>
  )
}

export default CwFlow
