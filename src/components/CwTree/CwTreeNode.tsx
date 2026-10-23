import { useContext, useMemo, useRef } from 'react'
import type {
  DragEvent as ReactDragEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import type {
  CwTreeCheckInfo,
  CwTreeExpandInfo,
  CwTreeInteractionEvent,
  CwTreeNode as TreeNode,
  CwTreeReorderPayload,
  CwTreeSelectInfo,
  CwTreeSize,
  CwTreeStyles,
  CwTreeTexts,
} from './types'
import CwIcon from '../CwIcon/CwIcon'
import CwCheckbox from '../CwCheckbox/CwCheckbox'
import CwLoading from '../CwLoading/CwLoading'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import { isExpandable, useCwTreeLazyContext } from './cwTreeLazyContext'
import { CW_TREE_REORDER_CONTEXT } from './cwTreeReorderContext'
import { CW_TREE_NODE_DRAG_MIME } from './treeDragMime'

export interface CwTreeNodeComponentProps {
  node: TreeNode
  level: number
  expandedKeys: Set<string | number>
  selectedKeys: Set<string | number>
  checkedKeys: Set<string | number>
  checkable: boolean
  selectable: boolean
  folderSelectable: boolean
  highlightParentOnChildSelected: boolean
  multiple: boolean
  showLine: boolean
  showIcon: boolean
  switcherIcon: boolean
  /** 叶子是否预留箭头列空白；默认 true */
  reserveLeafSwitcherSpace: boolean
  expandOnClickNode: boolean
  accordion: boolean
  indentSize: number
  size?: CwTreeSize
  draggable: boolean
  reorderable: boolean
  nodeDraggable?: (node: TreeNode) => boolean
  treeStyles: CwTreeStyles
  texts: CwTreeTexts
  parentPath: (string | number)[]
  /**
   * 是否渲染嵌套子节点 DOM。虚拟滚动时由父列表扁平渲染，设为 false。
   */
  renderChildren?: boolean
  iconSlot?: (scope: { node: TreeNode }) => ReactNode
  extraSlot?: (scope: { node: TreeNode }) => ReactNode
  labelSlot?: (scope: { node: TreeNode }) => ReactNode
  onNodeClick?: (node: TreeNode, event: CwTreeInteractionEvent) => void
  onNodeContextmenu?: (
    node: TreeNode,
    event: ReactMouseEvent<HTMLElement>,
  ) => void
  onNodeSelect?: (
    keys: (string | number)[],
    info: CwTreeSelectInfo,
  ) => void
  onNodeCheck?: (keys: (string | number)[], info: CwTreeCheckInfo) => void
  onNodeExpand?: (keys: (string | number)[], info: CwTreeExpandInfo) => void
  onNodeReorder?: (payload: CwTreeReorderPayload) => void
}

const basePaddingMap = {
  small: 6, // pl-1.5 = 0.375rem = 6px
  medium: 8, // pl-2 = 0.5rem = 8px
  large: 10, // pl-2.5 = 0.625rem = 10px
} as const

const nodeHeight = 36 // 节点高度，用于计算连接线

// 递归检查子节点是否被勾选（任一后代）
function isChildChecked(node: TreeNode, checkedKeys: Set<string | number>): boolean {
  if (checkedKeys.has(node.key)) return true
  if (node.children) {
    return node.children.some((child) => isChildChecked(child, checkedKeys))
  }
  return false
}

// 递归检查子节点是否全部被勾选（仅看后代叶子，不因父 key 残留而误判）
function isChildFullyChecked(
  node: TreeNode,
  checkedKeys: Set<string | number>,
): boolean {
  if (node.children?.length) {
    return node.children.every((child) =>
      isChildFullyChecked(child, checkedKeys),
    )
  }
  return checkedKeys.has(node.key)
}

export function CwTreeNode({
  node,
  level,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  checkable,
  selectable,
  folderSelectable,
  highlightParentOnChildSelected,
  multiple,
  showLine,
  showIcon,
  switcherIcon,
  reserveLeafSwitcherSpace,
  expandOnClickNode,
  accordion,
  indentSize,
  size,
  draggable,
  reorderable,
  nodeDraggable,
  treeStyles: styles,
  texts,
  parentPath,
  renderChildren = true,
  iconSlot,
  extraSlot,
  labelSlot,
  onNodeClick,
  onNodeContextmenu,
  onNodeSelect,
  onNodeCheck,
  onNodeExpand,
  onNodeReorder,
}: CwTreeNodeComponentProps) {
  const treeLazy = useCwTreeLazyContext()
  const treeReorder = useContext(CW_TREE_REORDER_CONTEXT)
  const {
    isFocusVisible,
    handleFocus: handleFocusVisible,
    handleBlur: handleBlurVisible,
  } = useBrowserFocusVisible()

  // 异步懒加载完成后读取最新展开态，避免闭包过期
  const expandedKeysRef = useRef(expandedKeys)
  expandedKeysRef.current = expandedKeys

  const hasChildContent = (node.children?.length ?? 0) > 0

  /** 是否显示展开箭头（含：有子节点 / 空文件夹 / 懒加载且未请求） */
  const hasExpandable = isExpandable(
    treeLazy?.loadDataEnabled ?? false,
    node,
    () => false,
  )

  const isLazyRowLoading =
    treeLazy != null && treeLazy.isLoadingKey(node.key)

  const hasChildren = hasChildContent

  const isExpanded = expandedKeys.has(node.key)
  const isSelected = selectedKeys.has(node.key)
  const isDisabled = node.disabled === true

  const hasSelectedChild = useMemo(() => {
    if (!highlightParentOnChildSelected || !hasChildren) return false
    const stack: TreeNode[] = [...(node.children ?? [])]
    while (stack.length > 0) {
      const current = stack.shift()!
      if (selectedKeys.has(current.key)) return true
      if (current.children && current.children.length > 0) {
        stack.push(...current.children)
      }
    }
    return false
  }, [highlightParentOnChildSelected, hasChildren, node.children, selectedKeys])

  const isChecked = !hasChildren
    ? checkedKeys.has(node.key)
    : !checkable
      ? false
      : (node.children ?? []).every((child) =>
          isChildFullyChecked(child, checkedKeys),
        )

  const isIndeterminate =
    checkable &&
    hasChildren &&
    !isChecked &&
    (node.children ?? []).some(
      (child) =>
        checkedKeys.has(child.key) || isChildChecked(child, checkedKeys),
    )

  const checkboxValue: boolean | 'indeterminate' = isIndeterminate
    ? 'indeterminate'
    : isChecked

  const switcherIconStyles = {
    class: [
      'inline-flex items-center justify-center transition-transform duration-200',
      isExpanded
        ? styles.nodeSwitcherExpanded
        : styles.nodeSwitcherCollapsed,
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    size: 0.75,
  }

  let rowDraggable = false
  if (!isDisabled) {
    if (reorderable) rowDraggable = true
    else if (draggable) rowDraggable = nodeDraggable ? nodeDraggable(node) : true
  }

  const dropTarget = treeReorder?.dropTarget
  const showDropBefore =
    reorderable &&
    dropTarget?.key === node.key &&
    dropTarget.position === 'before'
  const showDropAfter =
    reorderable &&
    dropTarget?.key === node.key &&
    dropTarget.position === 'after'
  const showDropInside =
    reorderable &&
    dropTarget?.key === node.key &&
    dropTarget.position === 'inside'

  const nodeCheckable = node.checkable !== false && checkable
  const indent = level * indentSize
  const paddingLeft = indent + basePaddingMap[size || 'medium']
  const parentPathWithCurrent = [...parentPath, node.key]

  // 递归计算节点及其所有展开子节点的总高度（用于连接线）
  const getChildHeight = (childNode: TreeNode): number => {
    let height = nodeHeight
    if (
      childNode.children &&
      childNode.children.length > 0 &&
      expandedKeys.has(childNode.key)
    ) {
      childNode.children.forEach((grandChild) => {
        height += getChildHeight(grandChild)
      })
    }
    return height
  }

  const resolveReorderPosition = (
    event: ReactDragEvent<HTMLDivElement>,
  ): 'before' | 'after' | 'inside' => {
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const acceptInside = node.acceptDropInside === true
    if (!acceptInside) {
      return y < rect.height / 2 ? 'before' : 'after'
    }
    const band = rect.height / 3
    if (y < band) return 'before'
    if (y > rect.height - band) return 'after'
    return 'inside'
  }

  const handleClick = (event: CwTreeInteractionEvent) => {
    if (isDisabled) return

    if (expandOnClickNode && hasExpandable) {
      void handleToggle()
    }

    if (selectable) {
      // 文件夹不可选中时，跳过选中逻辑
      if (!(hasExpandable && !folderSelectable)) {
        onNodeSelect?.([node.key], {
          node,
          selected: true,
          event,
        })
      }
    }

    onNodeClick?.(node, event)
  }

  const handleContextMenu = (event: ReactMouseEvent<HTMLElement>) => {
    if (isDisabled) return
    event.preventDefault()
    event.stopPropagation()

    if (selectable) {
      if (!(hasExpandable && !folderSelectable)) {
        if (!selectedKeys.has(node.key)) {
          onNodeSelect?.([node.key], {
            node,
            selected: true,
            event,
          })
        }
      }
    }

    onNodeContextmenu?.(node, event)
  }

  const handleToggle = async (event?: ReactMouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    if (isDisabled) return

    const currentExpandedKeys = expandedKeysRef.current
    const newExpandedKeys = new Set(currentExpandedKeys)
    if (currentExpandedKeys.has(node.key)) {
      const removeNodeAndChildren = (nodeKey: string | number) => {
        newExpandedKeys.delete(nodeKey)
        if (node.children) {
          node.children.forEach((child) => {
            if (newExpandedKeys.has(child.key)) {
              removeNodeAndChildren(child.key)
            }
          })
        }
      }
      removeNodeAndChildren(node.key)
    } else {
      if (treeLazy) {
        const ok = await treeLazy.tryExpandAndThen(node)
        if (!ok) return
      }
      newExpandedKeys.add(node.key)
    }

    onNodeExpand?.(Array.from(newExpandedKeys), {
      node,
      expanded: !currentExpandedKeys.has(node.key),
    })
  }

  const handleCheckboxChange = (value: boolean | 'indeterminate') => {
    if (isDisabled) return

    const newCheckedKeys = new Set(checkedKeys)
    const checked = value === true

    if (checked) {
      newCheckedKeys.add(node.key)
      if (hasChildren) {
        const checkChildren = (child: TreeNode) => {
          newCheckedKeys.add(child.key)
          if (child.children) {
            child.children.forEach(checkChildren)
          }
        }
        node.children?.forEach(checkChildren)
      }
    } else {
      newCheckedKeys.delete(node.key)
      if (hasChildren) {
        const uncheckChildren = (child: TreeNode) => {
          newCheckedKeys.delete(child.key)
          if (child.children) {
            child.children.forEach(uncheckChildren)
          }
        }
        node.children?.forEach(uncheckChildren)
      }
      // 取消子节点时同步去掉祖先 key，避免父级仍显示选中
      for (const ancestorKey of parentPath) {
        newCheckedKeys.delete(ancestorKey)
      }
    }

    onNodeCheck?.(Array.from(newCheckedKeys), {
      node,
      checked,
    })
  }

  const handleFocus = (_event: ReactFocusEvent<HTMLElement>) => {
    if (isDisabled) return
    handleFocusVisible()
  }

  const handleBlur = () => {
    handleBlurVisible()
  }

  const handleDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!rowDraggable) {
      event.preventDefault()
      return
    }
    const key = String(node.key)
    event.dataTransfer?.setData('text/plain', key)
    event.dataTransfer?.setData(CW_TREE_NODE_DRAG_MIME, key)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = reorderable ? 'move' : 'copy'
    }
    if (reorderable) {
      treeReorder?.startDrag(node.key)
    }
  }

  const handleDragEnd = () => {
    treeReorder?.endDrag()
  }

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!reorderable || !treeReorder?.draggingKey) return
    if (treeReorder.draggingKey === node.key) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    treeReorder.setDropTarget(node.key, resolveReorderPosition(event))
  }

  const handleDragLeave = () => {
    if (!reorderable || !treeReorder?.dropTarget) return
    if (treeReorder.dropTarget.key === node.key) {
      treeReorder.clearDropTarget()
    }
  }

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!reorderable || !treeReorder?.draggingKey) return
    const dragKey = treeReorder.draggingKey
    if (dragKey === node.key) return
    event.preventDefault()
    event.stopPropagation()
    const position = resolveReorderPosition(event)
    onNodeReorder?.({ dragKey, dropKey: node.key, position })
    treeReorder.endDrag()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleClick(event)
        break
      case 'ArrowRight':
        if (hasExpandable && !isExpanded) {
          event.preventDefault()
          void handleToggle()
        }
        break
      case 'ArrowLeft':
        if (hasExpandable && isExpanded) {
          event.preventDefault()
          void handleToggle()
        }
        break
    }
  }

  const nodeContentClassName = [
    styles.nodeContent,
    isSelected ? styles.nodeContentSelected : '',
    hasSelectedChild && !isSelected ? styles.nodeContentHighlighted : '',
    isDisabled ? styles.nodeContentDisabled : '',
    isFocusVisible ? styles.nodeContentFocused : '',
    rowDraggable ? 'select-none' : '',
    reorderable ? 'relative' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={styles.node}
      role="treeitem"
      aria-expanded={hasExpandable ? isExpanded : undefined}
      aria-busy={isLazyRowLoading ? 'true' : undefined}
    >
      <div
        className={nodeContentClassName}
        style={{ paddingLeft: `${paddingLeft}px` }}
        tabIndex={isDisabled ? undefined : 0}
        aria-disabled={isDisabled ? 'true' : 'false'}
        aria-selected={selectable && !isDisabled ? isSelected : undefined}
        draggable={rowDraggable}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {showDropBefore ? (
          <div className={styles.nodeDropBefore} aria-hidden="true" />
        ) : null}
        {showDropAfter ? (
          <div className={styles.nodeDropAfter} aria-hidden="true" />
        ) : null}
        {showDropInside ? (
          <div className={styles.nodeDropInside} aria-hidden="true" />
        ) : null}

        {/* 展开/折叠图标（懒加载中：与箭头同列显示 loading，不占图标列） */}
        {switcherIcon && hasExpandable && isLazyRowLoading ? (
          <div
            className={[
              styles.nodeSwitcher,
              styles.nodeSwitcherLazyLoading,
              hasSelectedChild && !isSelected
                ? styles.nodeSwitcherHighlighted
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            <CwLoading type="spinner" size="small" appearance="treeInline" />
          </div>
        ) : switcherIcon && hasExpandable ? (
          <div
            className={[
              styles.nodeSwitcher,
              hasSelectedChild && !isSelected
                ? styles.nodeSwitcherHighlighted
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              event.stopPropagation()
              void handleToggle(event)
            }}
          >
            <CwIcon
              name="common--dir--arrow-down-line"
              prefix="icon"
              size={switcherIconStyles.size}
              className={switcherIconStyles.class}
            />
          </div>
        ) : switcherIcon && reserveLeafSwitcherSpace ? (
          <div className={styles.nodeSwitcher} />
        ) : null}

        {/* 复选框 */}
        {nodeCheckable ? (
          <div
            className={styles.nodeCheckbox}
            style={{ lineHeight: 1 }}
            onClick={(event) => event.stopPropagation()}
          >
            <CwCheckbox
              value={checkboxValue}
              disabled={isDisabled}
              onChange={handleCheckboxChange}
            />
          </div>
        ) : null}

        {/* 节点图标（无箭头列时懒加载仍显示在图标位） */}
        {isLazyRowLoading && !switcherIcon ? (
          <span className={styles.nodeIcon} aria-hidden="true">
            <CwLoading type="spinner" size="small" appearance="treeInline" />
          </span>
        ) : showIcon && (iconSlot != null || node.icon) ? (
          <span className={styles.nodeIcon}>
            {iconSlot != null ? (
              iconSlot({ node })
            ) : node.icon ? (
              <span>{node.icon}</span>
            ) : null}
          </span>
        ) : null}

        {/* 节点标签 */}
        <span
          className={[
            styles.nodeLabel,
            node.labelStrong ? styles.nodeLabelStrong : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {labelSlot != null ? labelSlot({ node }) : node.label}
        </span>

        {/* 节点额外内容（右侧操作按钮等） */}
        {extraSlot != null ? (
          <span
            className={styles.nodeExtra}
            onClick={(event) => event.stopPropagation()}
          >
            {extraSlot({ node })}
          </span>
        ) : null}
      </div>

      {/* 连接线 */}
      {renderChildren && showLine && hasChildContent && isExpanded
        ? (node.children ?? []).map((child) => (
            <div
              key={child.key}
              className={[styles.line, styles.lineVertical]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${paddingLeft + 6}px`,
                top: `${nodeHeight}px`,
                height: `${getChildHeight(child)}px`,
                width: '1px',
              }}
            />
          ))
        : null}

      {/* 子节点：折叠时不渲染子节点，避免创建大量组件实例 */}
      {renderChildren && hasExpandable && isExpanded ? (
        <div
          className={[styles.nodeChildren, styles.nodeChildrenOpen]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.nodeChildrenContent}>
            {(node.children ?? []).map((child) => (
              <CwTreeNode
                key={child.key}
                node={child}
                level={level + 1}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                checkable={checkable}
                selectable={selectable}
                folderSelectable={folderSelectable}
                highlightParentOnChildSelected={
                  highlightParentOnChildSelected
                }
                multiple={multiple}
                showLine={showLine}
                showIcon={showIcon}
                switcherIcon={switcherIcon}
                reserveLeafSwitcherSpace={reserveLeafSwitcherSpace}
                expandOnClickNode={expandOnClickNode}
                accordion={accordion}
                indentSize={indentSize}
                size={size}
                draggable={draggable}
                reorderable={reorderable}
                nodeDraggable={nodeDraggable}
                treeStyles={styles}
                texts={texts}
                parentPath={parentPathWithCurrent}
                renderChildren={true}
                iconSlot={iconSlot}
                extraSlot={extraSlot}
                labelSlot={labelSlot}
                onNodeClick={onNodeClick}
                onNodeContextmenu={onNodeContextmenu}
                onNodeSelect={onNodeSelect}
                onNodeCheck={onNodeCheck}
                onNodeExpand={onNodeExpand}
                onNodeReorder={onNodeReorder}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CwTreeNode
