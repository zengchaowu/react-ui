import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react'
import { graphBase } from '@zengchaowu/ui-shared/components/CwGraph/styles'
import type {
  CwGraphEdge,
  CwGraphEmits,
  CwGraphNode,
  CwGraphProps,
} from './types'

export interface CwGraphComponentProps
  extends CwGraphProps,
    CwGraphEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

interface PositionedNode extends CwGraphNode {
  x: number
  y: number
  vx: number
  vy: number
}

interface GraphBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  offsetX: number
  offsetY: number
}

interface RenderedEdge extends CwGraphEdge {
  id: string | number
  x1: number
  y1: number
  x2: number
  y2: number
}

// 初始化节点位置
function initializeNodes(nodes: CwGraphNode[]): PositionedNode[] {
  // 先用默认尺寸初始化
  const defaultWidth = 800
  const defaultHeight = 600

  return nodes.map((node, index) => {
    if (node.x !== undefined && node.y !== undefined) {
      return {
        ...node,
        x: node.x,
        y: node.y,
        vx: 0,
        vy: 0
      }
    }

    // 如果没有指定位置，随机或圆形分布
    const angle = (index / nodes.length) * 2 * Math.PI
    const radius = Math.min(defaultWidth, defaultHeight) / 3
    return {
      ...node,
      x: defaultWidth / 2 + radius * Math.cos(angle),
      y: defaultHeight / 2 + radius * Math.sin(angle),
      vx: 0,
      vy: 0
    }
  })
}

// 力导向布局算法
function applyForceLayout(
  sourceNodes: PositionedNode[],
  edges: CwGraphEdge[],
  nodeWidth: number,
  iterations: number,
): PositionedNode[] {
  const positionedNodes = sourceNodes.map((node) => ({ ...node }))
  const repulsionStrength = 15000
  const attractionStrength = 0.005
  const damping = 0.85
  const minDistance = nodeWidth * 4

  for (let iter = 0; iter < iterations; iter++) {
    // 计算斥力
    for (let i = 0; i < positionedNodes.length; i++) {
      for (let j = i + 1; j < positionedNodes.length; j++) {
        const nodeA = positionedNodes[i]
        const nodeB = positionedNodes[j]

        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        if (distance < minDistance) {
          const force = repulsionStrength / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          nodeA.vx -= fx
          nodeA.vy -= fy
          nodeB.vx += fx
          nodeB.vy += fy
        }
      }
    }

    // 计算引力（边的吸引力）
    edges.forEach(edge => {
      const source = positionedNodes.find(n => n.id === edge.source)
      const target = positionedNodes.find(n => n.id === edge.target)

      if (source && target) {
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        const force = attractionStrength * distance
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      }
    })

    // 更新位置
    positionedNodes.forEach(node => {
      node.vx *= damping
      node.vy *= damping
      node.x += node.vx
      node.y += node.vy
    })
  }

  return positionedNodes
}

// 计算图的边界和偏移
function computeGraphBounds(
  positionedNodes: PositionedNode[],
  nodeWidth: number,
  nodeHeight: number,
): GraphBounds {
  if (positionedNodes.length === 0) {
    return { minX: 0, maxX: 400, minY: 0, maxY: 400, offsetX: 0, offsetY: 0 }
  }

  const padding = 50
  const minX = Math.min(...positionedNodes.map(n => n.x - nodeWidth / 2))
  const maxX = Math.max(...positionedNodes.map(n => n.x + nodeWidth / 2))
  const minY = Math.min(...positionedNodes.map(n => n.y - nodeHeight / 2))
  const maxY = Math.max(...positionedNodes.map(n => n.y + nodeHeight / 2))

  return {
    minX,
    maxX,
    minY,
    maxY,
    offsetX: padding - minX,
    offsetY: padding - minY
  }
}

// 计算渲染用的边
function computeRenderedEdges(
  edges: CwGraphEdge[],
  positionedNodes: PositionedNode[],
  graphBounds: GraphBounds,
  nodeWidth: number,
  directed: boolean,
): RenderedEdge[] {
  const rendered: Array<RenderedEdge | null> = edges.map((edge, index) => {
    const source = positionedNodes.find(n => n.id === edge.source)
    const target = positionedNodes.find(n => n.id === edge.target)

    if (!source || !target) {
      return null
    }

    // 计算边的起点和终点（考虑节点大小）
    const dx = target.x - source.x
    const dy = target.y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance === 0) {
      return null
    }

    const offset = nodeWidth / 2
    const targetOffset = (edge.directed || directed) ? offset + 10 : offset

    const x1 = source.x + (dx / distance) * offset + graphBounds.offsetX
    const y1 = source.y + (dy / distance) * offset + graphBounds.offsetY
    const x2 = target.x - (dx / distance) * targetOffset + graphBounds.offsetX
    const y2 = target.y - (dy / distance) * targetOffset + graphBounds.offsetY

    return {
      ...edge,
      id: edge.id || `edge-${index}`,
      x1,
      y1,
      x2,
      y2
    }
  })

  return rendered.filter((edge): edge is RenderedEdge => edge !== null)
}

export function CwGraph(props: CwGraphComponentProps) {
  const {
    nodes,
    edges,
    nodeWidth = 80,
    nodeHeight = 50,
    directed = false,
    showEdgeLabel = true,
    showEdgeWeight = true,
    nodeClass = '',
    textClass = '',
    edgeClass = '',
    edgeLabelClass = '',
    arrowClass = '',
    autoLayout = true,
    layoutIterations = 100,
    texts: _texts,
    onNodeClick,
    onEdgeClick,
    onNodeDrag,
    onNodeDragEnd,
    className,
    ...rest
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const draggingNodeRef = useRef<PositionedNode | null>(null)
  const removeDragListenersRef = useRef<(() => void) | null>(null)

  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>(() => {
    const initial = initializeNodes(nodes)
    return autoLayout ? applyForceLayout(initial, edges, nodeWidth, layoutIterations) : initial
  })

  const positionedNodesRef = useRef(positionedNodes)
  positionedNodesRef.current = positionedNodes

  // 监听数据变化
  useEffect(() => {
    const initial = initializeNodes(nodes)
    setPositionedNodes(
      autoLayout ? applyForceLayout(initial, edges, nodeWidth, layoutIterations) : initial
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes])

  useEffect(() => {
    if (!autoLayout) return
    setPositionedNodes((prev) => applyForceLayout(prev, edges, nodeWidth, layoutIterations))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges])

  useEffect(
    () => () => {
      removeDragListenersRef.current?.()
    },
    [],
  )

  // 计算图的边界和偏移
  const graphBounds = useMemo(
    () => computeGraphBounds(positionedNodes, nodeWidth, nodeHeight),
    [positionedNodes, nodeWidth, nodeHeight],
  )

  // 计算图的宽高（基于节点分布）
  const graphWidth = useMemo(() => {
    const padding = 50
    return Math.ceil(graphBounds.maxX - graphBounds.minX) + padding * 2
  }, [graphBounds])

  const graphHeight = useMemo(() => {
    const padding = 50
    return Math.ceil(graphBounds.maxY - graphBounds.minY) + padding * 2
  }, [graphBounds])

  const renderedEdges = useMemo(
    () => computeRenderedEdges(edges, positionedNodes, graphBounds, nodeWidth, directed),
    [edges, positionedNodes, graphBounds, nodeWidth, directed],
  )

  // 节点点击
  const handleNodeClick = (node: CwGraphNode, event: ReactMouseEvent<HTMLDivElement>) => {
    if (!node.disabled && !draggingNodeRef.current) {
      onNodeClick?.(node, event)
    }
  }

  // 边点击
  const handleEdgeClick = (edge: CwGraphEdge, event: ReactMouseEvent<SVGLineElement>) => {
    onEdgeClick?.(edge, event)
  }

  // 节点拖拽
  const handleNodeMouseDown = (node: PositionedNode, event: ReactMouseEvent<HTMLDivElement>) => {
    if (node.disabled) return

    const handleMouseMove = (e: MouseEvent) => {
      const draggingNode = draggingNodeRef.current
      const container = containerRef.current
      if (!draggingNode || !container) return

      const rect = container.getBoundingClientRect()
      const bounds = computeGraphBounds(positionedNodesRef.current, nodeWidth, nodeHeight)
      const newX = e.clientX - rect.left - bounds.offsetX
      const newY = e.clientY - rect.top - bounds.offsetY

      const nextNode = { ...draggingNode, x: newX, y: newY, vx: 0, vy: 0 }
      draggingNodeRef.current = nextNode
      setPositionedNodes((prev) => prev.map(n => (n.id === nextNode.id ? nextNode : n)))

      onNodeDrag?.(nextNode, newX, newY)
    }

    const removeDragListeners = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      removeDragListenersRef.current = null
    }

    const handleMouseUp = () => {
      const draggingNode = draggingNodeRef.current
      if (draggingNode) {
        onNodeDragEnd?.(draggingNode, draggingNode.x, draggingNode.y)
        draggingNodeRef.current = null
      }

      removeDragListeners()
    }

    draggingNodeRef.current = node
    removeDragListenersRef.current?.()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    removeDragListenersRef.current = removeDragListeners
  }

  return (
    <div
      ref={containerRef}
      className={[graphBase.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div
        className={graphBase.container}
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px` }}
      >
        {/* SVG 层：绘制边和箭头 */}
        <svg
          className={graphBase.svg}
          width={graphWidth}
          height={graphHeight}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              className={arrowClass || graphBase.arrow}
            >
              <polygon points="0 0, 10 3, 0 6" className={arrowClass || graphBase.arrow} />
            </marker>
          </defs>

          {/* 绘制边 */}
          {renderedEdges.map((edge) => (
            <g key={edge.id}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                className={[edgeClass || graphBase.edge, 'pointer-events-auto', 'cursor-pointer'].filter(Boolean).join(' ')}
                strokeWidth={2}
                markerEnd={(edge.directed || directed) ? 'url(#arrowhead)' : ''}
                onClick={(event) => handleEdgeClick(edge, event)}
              />

              {/* 边的标签 */}
              {showEdgeLabel && edge.label ? (
                <text
                  x={(edge.x1 + edge.x2) / 2}
                  y={(edge.y1 + edge.y2) / 2 - 5}
                  className={[edgeLabelClass, 'text-xs', 'fill-current'].filter(Boolean).join(' ')}
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              ) : null}

              {/* 边的权重 */}
              {showEdgeWeight && edge.weight !== undefined ? (
                <text
                  x={(edge.x1 + edge.x2) / 2}
                  y={(edge.y1 + edge.y2) / 2 + 12}
                  className={[edgeLabelClass, 'text-xs', 'fill-current', 'font-semibold'].filter(Boolean).join(' ')}
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              ) : null}
            </g>
          ))}
        </svg>

        {/* 节点 */}
        {positionedNodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: `${node.x - nodeWidth / 2 + graphBounds.offsetX}px`,
              top: `${node.y - nodeHeight / 2 + graphBounds.offsetY}px`,
              width: `${nodeWidth}px`,
              height: `${nodeHeight}px`
            }}
            onMouseDown={(event) => handleNodeMouseDown(node, event)}
          >
            <div
              className={[
                'w-full h-full flex flex-col items-center justify-center cursor-pointer select-none',
                nodeClass || graphBase.node,
                node.disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].filter(Boolean).join(' ')}
              onClick={(event) => handleNodeClick(node, event)}
            >
              {/* 节点内容 */}
              <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
                {node.icon ? <div dangerouslySetInnerHTML={{ __html: node.icon }} /> : null}
                <div className={[textClass || graphBase.nodeLabel, 'text-center', 'break-words', 'w-full', 'px-2'].filter(Boolean).join(' ')}>
                  {node.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CwGraph
