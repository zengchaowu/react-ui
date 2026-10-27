import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { CwDataTreeEmits, CwDataTreeNode, CwDataTreeNode as TreeNode, CwDataTreeProps } from './types'
import type { CwDataTreeTexts } from '@zengchaowu/ui-shared/components/CwDataTree/types'
import { dataTreeBase } from '@zengchaowu/ui-shared/components/CwDataTree/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDataTree/texts'
import CwIcon from '../CwIcon/CwIcon'
import {
  shouldShowFocus,
  useBrowserFocusVisible,
} from '../../hooks/useBrowserFocusVisible'

export interface CwDataTreeComponentProps
  extends CwDataTreeProps,
    CwDataTreeEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onClick'> {
  className?: string
}

interface NodePosition extends CwDataTreeNode {
  x: number
  y: number
  width: number
}

interface ConnectorLine {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  path: string
  stepPath: string
}

const EMPTY_KEYS: (string | number)[] = []

function collectExpandedKeys(
  nodes: TreeNode[],
  keys: Set<string | number> = new Set<string | number>(),
): Set<string | number> {
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      keys.add(node.id)
      collectExpandedKeys(node.children, keys)
    }
  })
  return keys
}

export function CwDataTree({
  data,
  defaultExpandAll = false,
  expandedKeys = EMPTY_KEYS,
  nodeWidth = 120,
  nodeHeight = 50,
  levelGap = 80,
  siblingGap = 20,
  showConnector = true,
  connectorStyle = 'straight',
  nodeClass = '',
  textClass = '',
  lineClass = '',
  buttonClass = '',
  texts: textsProp,
  className,
  onNodeClick,
  onNodeExpand,
  onNodeCollapse,
  onUpdateExpandedKeys,
  ...rest
}: CwDataTreeComponentProps) {
  // 挂载全局键盘/指针监听，供 shouldShowFocus 判定焦点可见性
  useBrowserFocusVisible()

  const styles = dataTreeBase
  const texts = useMemo<CwDataTreeTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const [internalExpandedKeys, setInternalExpandedKeys] = useState<
    Set<string | number>
  >(() => (defaultExpandAll ? collectExpandedKeys(data) : new Set()))

  useEffect(() => {
    if (!defaultExpandAll) return
    setInternalExpandedKeys(collectExpandedKeys(data))
  }, [data, defaultExpandAll])

  const expandedKeysSet = useMemo(
    () =>
      expandedKeys.length > 0 ? new Set(expandedKeys) : internalExpandedKeys,
    [expandedKeys, internalExpandedKeys],
  )

  const focusedNodes = useRef<Set<string | number>>(new Set())
  const focusedButtons = useRef<Set<string | number>>(new Set())
  const [focusedNodesForKeyboard, setFocusedNodesForKeyboard] = useState<
    Set<string | number>
  >(new Set())
  const [focusedButtonsForKeyboard, setFocusedButtonsForKeyboard] = useState<
    Set<string | number>
  >(new Set())

  const isExpanded = (nodeId: string | number) => expandedKeysSet.has(nodeId)

  const getIconStyles = (nodeId: string | number) => {
    const iconStyle = styles.iconStyles || {}
    const isNodeExpanded = isExpanded(nodeId)
    return {
      ...iconStyle,
      class: [
        iconStyle.class || '',
        isNodeExpanded ? styles.iconExpanded : styles.iconCollapsed,
      ]
        .filter(Boolean)
        .join(' '),
    }
  }

  const layout = useMemo(() => {
    const positions: NodePosition[] = []

    const calculateNodeWidth = (node: TreeNode): number => {
      if (
        !node.children ||
        node.children.length === 0 ||
        !expandedKeysSet.has(node.id)
      ) {
        return nodeWidth
      }

      const childrenWidth = node.children.reduce(
        (total, child) => total + calculateNodeWidth(child),
        0,
      )

      const gapsWidth = (node.children.length - 1) * siblingGap
      return Math.max(nodeWidth, childrenWidth + gapsWidth)
    }

    const layoutNodes = (nodes: TreeNode[], x: number, y: number) => {
      let currentX = x

      nodes.forEach((node) => {
        const nodeWidthTotal = calculateNodeWidth(node)
        const nodeCenterX = currentX + nodeWidthTotal / 2

        positions.push({
          ...node,
          x: nodeCenterX - nodeWidth / 2,
          y,
          width: nodeWidthTotal,
        })

        if (
          node.children &&
          node.children.length > 0 &&
          expandedKeysSet.has(node.id)
        ) {
          const childY = y + nodeHeight + levelGap
          layoutNodes(node.children, currentX, childY)
        }

        currentX += nodeWidthTotal + siblingGap
      })
    }

    layoutNodes(data, 0, 0)

    const width =
      positions.length === 0
        ? 400
        : Math.max(...positions.map((n) => n.x + nodeWidth))
    const height =
      positions.length === 0
        ? 300
        : Math.max(...positions.map((n) => n.y + nodeHeight))

    const lines: ConnectorLine[] = []

    const buildLines = (
      nodes: TreeNode[],
      parentX?: number,
      parentY?: number,
    ) => {
      nodes.forEach((node) => {
        const nodePos = positions.find((n) => n.id === node.id)
        if (!nodePos) return

        if (parentX !== undefined && parentY !== undefined) {
          const nodeCenterX = nodePos.x + nodeWidth / 2
          const nodeCenterY = nodePos.y

          const controlY = parentY + (nodeCenterY - parentY) / 2
          const midY = (parentY + nodeCenterY) / 2

          lines.push({
            id: `line-${node.id}`,
            x1: parentX,
            y1: parentY,
            x2: nodeCenterX,
            y2: nodeCenterY,
            path: `M ${parentX} ${parentY} C ${parentX} ${controlY}, ${nodeCenterX} ${controlY}, ${nodeCenterX} ${nodeCenterY}`,
            stepPath: `M ${parentX} ${parentY} L ${parentX} ${midY} L ${nodeCenterX} ${midY} L ${nodeCenterX} ${nodeCenterY}`,
          })
        }

        if (
          node.children &&
          node.children.length > 0 &&
          expandedKeysSet.has(node.id)
        ) {
          const nodeCenterX = nodePos.x + nodeWidth / 2
          const nodeCenterY = nodePos.y + nodeHeight
          buildLines(node.children, nodeCenterX, nodeCenterY)
        }
      })
    }

    buildLines(data)

    return {
      positions,
      treeWidth: width,
      treeHeight: height,
      connectorLines: lines,
    }
  }, [data, expandedKeysSet, nodeWidth, nodeHeight, levelGap, siblingGap])

  const { positions: flattenedNodes, treeWidth, treeHeight, connectorLines } =
    layout

  const handleNodeFocus = (node: TreeNode, event?: FocusEvent) => {
    if (node.disabled) return
    focusedNodes.current.add(node.id)
    // 只在键盘导航时设置 focusedNodesForKeyboard
    if (event && shouldShowFocus()) {
      setFocusedNodesForKeyboard((prev) => {
        if (prev.has(node.id)) return prev
        const next = new Set(prev)
        next.add(node.id)
        return next
      })
    } else if (!event) {
      // 如果没有事件（通过代码调用 focus），默认不显示 focus 样式
      setFocusedNodesForKeyboard((prev) => {
        if (!prev.has(node.id)) return prev
        const next = new Set(prev)
        next.delete(node.id)
        return next
      })
    }
  }

  const handleNodeBlur = (node: TreeNode) => {
    focusedNodes.current.delete(node.id)
    setFocusedNodesForKeyboard((prev) => {
      if (!prev.has(node.id)) return prev
      const next = new Set(prev)
      next.delete(node.id)
      return next
    })
  }

  const handleNodeKeyDown = (
    node: TreeNode,
    event: KeyboardEvent,
  ) => {
    if (node.disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onNodeClick?.(node, event as unknown as MouseEvent)
    }
  }

  const handleNodeClick = (node: TreeNode, event: MouseEvent) => {
    if (!node.disabled) {
      onNodeClick?.(node, event)
    }
  }

  const handleButtonFocus = (node: TreeNode, event?: FocusEvent) => {
    if (node.disabled) return
    focusedButtons.current.add(node.id)
    // 只在键盘导航时设置 focusedButtonsForKeyboard
    if (event && shouldShowFocus()) {
      setFocusedButtonsForKeyboard((prev) => {
        if (prev.has(node.id)) return prev
        const next = new Set(prev)
        next.add(node.id)
        return next
      })
    } else if (!event) {
      // 如果没有事件（通过代码调用 focus），默认不显示 focus 样式
      setFocusedButtonsForKeyboard((prev) => {
        if (!prev.has(node.id)) return prev
        const next = new Set(prev)
        next.delete(node.id)
        return next
      })
    }
  }

  const handleButtonBlur = (node: TreeNode) => {
    focusedButtons.current.delete(node.id)
    setFocusedButtonsForKeyboard((prev) => {
      if (!prev.has(node.id)) return prev
      const next = new Set(prev)
      next.delete(node.id)
      return next
    })
  }

  const handleToggle = (
    node: TreeNode,
    event?: MouseEvent | KeyboardEvent,
  ) => {
    if (node.disabled) return

    if (event) {
      event.stopPropagation()
    }

    const expanded = !isExpanded(node.id)
    const keys = new Set(expandedKeysSet)

    if (expanded) {
      keys.add(node.id)
      onNodeExpand?.(node)
    } else {
      keys.delete(node.id)
      onNodeCollapse?.(node)
    }

    setInternalExpandedKeys(keys)
    onUpdateExpandedKeys?.(Array.from(keys))
  }

  const handleButtonKeyDown = (
    node: TreeNode,
    event: KeyboardEvent,
  ) => {
    if (node.disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle(node, event)
    }
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div {...rest} className={rootClassName}>
      <div
        className={styles.container}
        style={{ width: `${treeWidth}px`, height: `${treeHeight}px` }}
      >
        {/* SVG 连接线 */}
        {showConnector ? (
          <svg
            className={styles.svg}
            width={treeWidth}
            height={treeHeight}
          >
            {connectorStyle === 'bezier'
              ? connectorLines.map((line) => (
                  <path
                    key={line.id}
                    d={line.path}
                    className={lineClass || styles.line}
                    strokeWidth={1.5}
                    fill="none"
                  />
                ))
              : connectorStyle === 'step'
                ? connectorLines.map((line) => (
                    <path
                      key={line.id}
                      d={line.stepPath}
                      className={lineClass || styles.line}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  ))
                : connectorLines.map((line) => (
                    <line
                      key={line.id}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      className={lineClass || styles.line}
                      strokeWidth={1.5}
                    />
                  ))}
          </svg>
        ) : null}

        {/* 节点 */}
        {flattenedNodes.map((node) => {
          const iconStyles = getIconStyles(node.id)
          const nodeWrapperClassName = [
            styles.nodeWrapper,
            nodeClass || styles.nodeContent,
            node.disabled ? styles.nodeContentDisabled : '',
            focusedNodesForKeyboard.has(node.id) && !node.disabled
              ? styles.nodeContentFocused
              : '',
          ]
            .filter(Boolean)
            .join(' ')

          const buttonWrapperClassName = [
            styles.buttonWrapper,
            buttonClass || styles.button,
            node.disabled ? styles.buttonDisabled : '',
            focusedButtonsForKeyboard.has(node.id) && !node.disabled
              ? styles.buttonFocused
              : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={node.id}
              className={styles.nodePosition}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${nodeWidth}px`,
                height: `${nodeHeight}px`,
              }}
            >
              <div
                className={nodeWrapperClassName}
                role="button"
                tabIndex={node.disabled ? undefined : 0}
                aria-disabled={node.disabled ? 'true' : 'false'}
                aria-label={node.label}
                onClick={(event: ReactMouseEvent<HTMLDivElement>) =>
                  handleNodeClick(node, event.nativeEvent)
                }
                onFocus={(event) => handleNodeFocus(node, event.nativeEvent)}
                onBlur={() => handleNodeBlur(node)}
                onKeyDown={(event) =>
                  handleNodeKeyDown(node, event.nativeEvent)
                }
              >
                {/* 节点内容 */}
                <div className={styles.nodeInner}>
                  {node.icon ? (
                    <div dangerouslySetInnerHTML={{ __html: node.icon }} />
                  ) : null}
                  <div
                    className={[styles.nodeText, textClass || styles.node]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {node.label}
                  </div>
                </div>

                {/* 展开/折叠按钮 */}
                {node.children && node.children.length > 0 ? (
                  <div
                    className={buttonWrapperClassName}
                    style={{
                      bottom: '-0.625rem',
                      width: '1.25rem',
                      height: '1.25rem',
                    }}
                    role="button"
                    tabIndex={node.disabled ? undefined : 0}
                    aria-disabled={node.disabled ? 'true' : 'false'}
                    aria-label={
                      isExpanded(node.id) ? texts.collapse : texts.expand
                    }
                    onClick={(event) => {
                      event.stopPropagation()
                      handleToggle(node, event.nativeEvent)
                    }}
                    onFocus={(event) =>
                      handleButtonFocus(node, event.nativeEvent)
                    }
                    onBlur={() => handleButtonBlur(node)}
                    onKeyDown={(event) =>
                      handleButtonKeyDown(node, event.nativeEvent)
                    }
                  >
                    <CwIcon
                      name="common--dir--arrow-down-line"
                      prefix="icon"
                      size={iconStyles?.size ?? 1}
                      className={iconStyles?.class}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CwDataTree
