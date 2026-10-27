import { useMemo } from 'react'
import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react'
import { tokenSolidColors, unionFindSetPalette } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { unionFindBase } from '@zengchaowu/ui-shared/components/CwUnionFind/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwUnionFind/texts'
import type { CwUnionFindElement, CwUnionFindEmits, CwUnionFindProps } from './types'
import type { CwUnionFindSet } from '@zengchaowu/ui-shared/components/CwUnionFind/types'

export interface CwUnionFindComponentProps
  extends CwUnionFindProps,
    CwUnionFindEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

interface PositionedNode extends CwUnionFindElement {
  x: number
  y: number
  level: number
  isRoot: boolean
  setColor: string
  subtreeWidth: number
}

interface RenderedEdge {
  from: string | number
  to: string | number
  x1: number
  y1: number
  x2: number
  y2: number
  path: string
}

interface BaseSet {
  root: string | number
  members: (string | number)[]
  color: string
}

interface PositionedSet extends BaseSet {
  labelX: number
  labelY: number
}

// 预定义的颜色集合（与 tokens.css 语义色一致）
const setColors = [...unionFindSetPalette]

// 构建集合信息
function computeSets(
  elements: CwUnionFindElement[],
  autoColorSets: boolean,
): BaseSet[] {
  const setsMap = new Map<string | number, CwUnionFindSet>()

  // 找到所有根节点
  elements.forEach(element => {
    let root = element.id
    const visited = new Set<string | number>()

    // 查找根节点
    while (true) {
      if (visited.has(root)) break // 防止循环引用
      visited.add(root)

      const current = elements.find(e => e.id === root)
      if (!current || current.parent === undefined || current.parent === root) {
        break
      }
      root = current.parent
    }

    if (!setsMap.has(root)) {
      setsMap.set(root, {
        root,
        members: []
      })
    }

    setsMap.get(root)!.members.push(element.id)
  })

  // 为每个集合分配颜色
  const setsArray = Array.from(setsMap.values())
  return setsArray.map((set, index) => ({
    ...set,
    color: autoColorSets
      ? setColors[index % setColors.length]
      : tokenSolidColors.successColor6
  }))
}

// 计算节点位置（使用类似 CwDataTree 的算法）
function calculateNodePositions(
  elements: CwUnionFindElement[],
  sets: BaseSet[],
  nodeWidth: number,
  nodeHeight: number,
  levelGap: number,
  siblingGap: number,
): PositionedNode[] {
  const nodeMap = new Map<string | number, PositionedNode>()

  // 第一步：识别所有节点和根节点
  elements.forEach((element) => {
    const setIndex = sets.findIndex(s => s.members.includes(element.id))
    const color = sets[setIndex]?.color || setColors[0]

    const node: PositionedNode = {
      ...element,
      x: 0,
      y: 0,
      level: 0,
      isRoot: element.parent === undefined || element.parent === element.id,
      setColor: color,
      subtreeWidth: 0
    }

    nodeMap.set(element.id, node)
  })

  // 第二步：计算每个节点的层级
  const calculateLevel = (nodeId: string | number, level: number = 0) => {
    const node = nodeMap.get(nodeId)
    if (!node) return

    node.level = level

    // 找到所有子节点
    const children = elements.filter(e => e.parent === nodeId && e.id !== nodeId)
    children.forEach(child => {
      calculateLevel(child.id, level + 1)
    })
  }

  // 第三步：计算每个节点的子树宽度（从底向上）
  const calculateSubtreeWidth = (nodeId: string | number): number => {
    const node = nodeMap.get(nodeId)
    if (!node) return nodeWidth

    const children = elements.filter(e => e.parent === nodeId && e.id !== nodeId)

    if (children.length === 0) {
      node.subtreeWidth = nodeWidth
      return nodeWidth
    }

    const childrenWidth = children.reduce((total, child) => {
      return total + calculateSubtreeWidth(child.id)
    }, 0)

    const gapsWidth = (children.length - 1) * siblingGap
    node.subtreeWidth = Math.max(nodeWidth, childrenWidth + gapsWidth)

    return node.subtreeWidth
  }

  // 第四步：为每个集合单独布局
  let currentSetX = 0

  sets.forEach(set => {
    const root = nodeMap.get(set.root)
    if (!root) return

    // 计算这个集合的层级和子树宽度
    calculateLevel(set.root, 0)
    calculateSubtreeWidth(set.root)

    // 布局函数（从上往下）
    const layoutNode = (nodeId: string | number, x: number, y: number) => {
      const node = nodeMap.get(nodeId)
      if (!node) return

      // 设置节点位置（中心对齐）
      node.x = x + node.subtreeWidth / 2 - nodeWidth / 2
      node.y = y

      // 布局子节点
      const children = elements.filter(e => e.parent === nodeId && e.id !== nodeId)
      if (children.length > 0) {
        let childX = x
        const childY = y + nodeHeight + levelGap

        children.forEach(child => {
          const childNode = nodeMap.get(child.id)
          if (childNode) {
            layoutNode(child.id, childX, childY)
            childX += childNode.subtreeWidth + siblingGap
          }
        })
      }
    }

    // 从根节点开始布局（增加顶部间距给标签留空间）
    layoutNode(set.root, currentSetX, 60)

    // 更新下一个集合的起始 X 位置
    currentSetX += root.subtreeWidth + 100
  })

  return Array.from(nodeMap.values())
}

// 计算集合标签位置
function computeSetLabels(
  sets: BaseSet[],
  positionedNodes: PositionedNode[],
  nodeWidth: number,
): PositionedSet[] {
  return sets.map((set) => {
    // 找到这个集合的所有节点
    const setNodes = positionedNodes.filter(n => set.members.includes(n.id))

    if (setNodes.length === 0) {
      return {
        ...set,
        labelX: 0,
        labelY: 0
      }
    }

    // 计算集合标签位置（在集合的最上方中间）
    const minY = Math.min(...setNodes.map(n => n.y))
    const minX = Math.min(...setNodes.map(n => n.x))
    const maxX = Math.max(...setNodes.map(n => n.x + nodeWidth))
    const centerX = (minX + maxX) / 2

    return {
      ...set,
      labelX: centerX, // 使用 transform: translateX(-50%) 实现居中
      labelY: minY - 40 // 增加间距，避免与节点重叠
    }
  })
}

// 计算渲染用的边（使用贝塞尔曲线）
function computeRenderedEdges(
  elements: CwUnionFindElement[],
  positionedNodes: PositionedNode[],
  nodeWidth: number,
  nodeHeight: number,
): RenderedEdge[] {
  const edges: RenderedEdge[] = []

  elements.forEach(element => {
    if (element.parent !== undefined && element.parent !== element.id) {
      const child = positionedNodes.find(n => n.id === element.id)
      const parent = positionedNodes.find(n => n.id === element.parent)

      if (child && parent) {
        // 从子节点顶部到父节点底部
        const x1 = child.x + nodeWidth / 2
        const y1 = child.y
        const x2 = parent.x + nodeWidth / 2
        const y2 = parent.y + nodeHeight

        // 贝塞尔曲线控制点
        const controlY = y2 + (y1 - y2) / 2
        const path = `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`

        edges.push({
          from: element.id,
          to: element.parent,
          x1,
          y1,
          x2,
          y2,
          path
        })
      }
    }
  })

  return edges
}

export function CwUnionFind(props: CwUnionFindComponentProps) {
  const {
    elements,
    nodeWidth = 80,
    nodeHeight = 50,
    levelGap = 80,
    siblingGap = 20,
    nodeClass = '',
    rootNodeClass = '',
    textClass = '',
    edgeClass: _edgeClass,
    showRank = true,
    showSize = true,
    autoColorSets = true,
    texts: textsProp,
    onNodeClick,
    onSetClick,
    className,
    ...rest
  } = props

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const baseSets = useMemo(
    () => computeSets(elements, autoColorSets),
    [elements, autoColorSets],
  )

  const positionedNodes = useMemo(
    () => calculateNodePositions(elements, baseSets, nodeWidth, nodeHeight, levelGap, siblingGap),
    [elements, baseSets, nodeWidth, nodeHeight, levelGap, siblingGap],
  )

  const sets = useMemo(
    () => computeSetLabels(baseSets, positionedNodes, nodeWidth),
    [baseSets, positionedNodes, nodeWidth],
  )

  const renderedEdges = useMemo(
    () => computeRenderedEdges(elements, positionedNodes, nodeWidth, nodeHeight),
    [elements, positionedNodes, nodeWidth, nodeHeight],
  )

  // 计算图的宽高
  const graphWidth = useMemo(() => {
    if (positionedNodes.length === 0) return 400

    const maxX = Math.max(...positionedNodes.map(n => n.x + nodeWidth))
    return Math.ceil(maxX + 20)
  }, [positionedNodes, nodeWidth])

  const graphHeight = useMemo(() => {
    if (positionedNodes.length === 0) return 400

    const maxY = Math.max(...positionedNodes.map(n => n.y + nodeHeight))
    return Math.ceil(maxY + 20)
  }, [positionedNodes, nodeHeight])

  // 节点点击
  const handleNodeClick = (node: CwUnionFindElement, event: ReactMouseEvent<HTMLDivElement>) => {
    onNodeClick?.(node, event)
  }

  // 集合点击
  const handleSetClick = (set: CwUnionFindSet, event: ReactMouseEvent<HTMLDivElement>) => {
    onSetClick?.(set, event)
  }

  return (
    <div className={[unionFindBase.root, className].filter(Boolean).join(' ')} {...rest}>
      <div
        className={unionFindBase.container}
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px` }}
      >
        {/* SVG 层：绘制父子关系的边 */}
        <svg
          className={unionFindBase.svg}
          width={graphWidth}
          height={graphHeight}
        >
          {/* 绘制边 */}
          {renderedEdges.map((edge) => (
            <path
              key={`${edge.from}-${edge.to}`}
              d={edge.path}
              className={unionFindBase.edge}
              strokeWidth={1.5}
              fill="none"
            />
          ))}
        </svg>

        {/* 集合标签 */}
        {sets.map((set) => (
          <div
            key={set.root}
            className={unionFindBase.setLabel}
            style={{
              left: `${set.labelX}px`,
              top: `${set.labelY}px`,
              backgroundColor: set.color + '15',
              borderColor: set.color + '60',
              color: set.color
            }}
            onClick={(event) => handleSetClick(set, event)}
          >
            {texts.sets} {set.root} <span className="opacity-70">({set.members.length})</span>
          </div>
        ))}

        {/* 节点 */}
        {positionedNodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${nodeWidth}px`,
              height: `${nodeHeight}px`
            }}
          >
            <div
              className={[
                'w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-all',
                node.isRoot ? rootNodeClass : nodeClass,
                node.disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].filter(Boolean).join(' ')}
              style={{
                backgroundColor: node.isRoot ? node.setColor + '15' : tokenSolidColors.white,
                borderColor: node.setColor,
                boxShadow: node.isRoot ? `0 0 0 3px ${node.setColor}20` : undefined
              }}
              onClick={(event) => handleNodeClick(node, event)}
            >
              {/* 节点内容 */}
              <div className="flex flex-col items-center justify-center w-full h-full px-2 py-1 overflow-hidden">
                <div className={['text-center break-words line-clamp-1 w-full flex-shrink-0', textClass].filter(Boolean).join(' ')} style={{ color: node.setColor }}>
                  {node.label}
                </div>
                {(showRank && node.rank !== undefined) || (showSize && node.size !== undefined && node.isRoot) ? (
                  <div
                    className="flex items-center gap-2 text-xs opacity-60 whitespace-nowrap mt-0.5 flex-shrink-0"
                    style={{ color: node.setColor }}
                  >
                    {showRank && node.rank !== undefined ? <span>r:{node.rank}</span> : null}
                    {showSize && node.size !== undefined && node.isRoot ? <span>s:{node.size}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CwUnionFind
