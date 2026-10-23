import { useMemo } from 'react'
import CwTree from '../CwTree/CwTree'
import CwIcon from '../CwIcon/CwIcon'
import type { CwTreeNode } from '../CwTree/types'
import { CW_TREE_STYLES_OVERRIDE_CONTEXT } from '../CwTree/cwTreeStylesOverride'
import type { CwNavigationTreeProps } from './types'
import {
  resolveNavigationTreeIconEmbed,
  resolveNavigationTreeSwitcherIconEmbed,
  resolveNavigationTreeTreeOverride,
} from './navigationTreeAppearance'

const EMPTY_TREE_DATA: CwTreeNode[] = []
const EMPTY_KEYS: (string | number)[] = []

export function CwNavigationTree({
  treeData = EMPTY_TREE_DATA,
  selectedKeys = EMPTY_KEYS,
  expandedKeys = EMPTY_KEYS,
  expandOnClickNode = true,
  highlightParentOnChildSelected = true,
  appearance = 'admin',
  texts: _texts,
  className,
  onUpdateSelectedKeys,
  onUpdateExpandedKeys,
  onNodeSelect,
  ...rest
}: CwNavigationTreeProps) {
  const treeStylesOverride = useMemo(
    () => resolveNavigationTreeTreeOverride(appearance),
    [appearance],
  )
  const iconEmbed = useMemo(
    () => resolveNavigationTreeIconEmbed(appearance),
    [appearance],
  )
  const switcherIconEmbed = useMemo(
    () => resolveNavigationTreeSwitcherIconEmbed(appearance),
    [appearance],
  )

  const expandedKeysSet = useMemo(
    () => new Set(expandedKeys),
    [expandedKeys],
  )

  const switcherRotateStyle = (
    nodeKey: string | number,
  ): { transform: string } => {
    const expanded = expandedKeysSet.has(nodeKey)
    return { transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }
  }

  const handleNodeSelect = (
    keys: (string | number)[],
    info: { node: CwTreeNode; selected: boolean },
  ) => {
    onNodeSelect?.(keys, info)
  }

  const handleNodeExpand = (
    keys: (string | number)[],
    _info: { node: CwTreeNode; expanded: boolean },
  ) => {
    onUpdateExpandedKeys?.(keys)
  }

  const handleToggleSwitcher = (node: CwTreeNode) => {
    const isExpanded = expandedKeysSet.has(node.key)
    const newExpandedKeys = [...expandedKeys]
    if (isExpanded) {
      const index = newExpandedKeys.indexOf(node.key)
      if (index > -1) newExpandedKeys.splice(index, 1)
    } else {
      if (!newExpandedKeys.includes(node.key)) newExpandedKeys.push(node.key)
    }
    onUpdateExpandedKeys?.(newExpandedKeys)
  }

  return (
    <CW_TREE_STYLES_OVERRIDE_CONTEXT.Provider value={treeStylesOverride}>
      <CwTree
        {...rest}
        data={treeData}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        switcherIcon={false}
        showIcon={true}
        selectable={true}
        multiple={false}
        expandOnClickNode={expandOnClickNode}
        highlightParentOnChildSelected={highlightParentOnChildSelected}
        className={className}
        iconSlot={({ node }) =>
          node.icon ? (
            <CwIcon
              name={node.icon}
              prefix="icon"
              size={iconEmbed.size ?? 1}
              className={iconEmbed.class}
            />
          ) : null
        }
        extraSlot={({ node }) =>
          node.children && node.children.length > 0 ? (
            <span
              className="inline-flex shrink-0 cursor-pointer items-center justify-center transition-transform duration-200 text-[var(--text-color-placeholder)]"
              style={switcherRotateStyle(node.key)}
              role="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={(event) => {
                event.stopPropagation()
                handleToggleSwitcher(node)
              }}
            >
              <CwIcon
                name="common--dir--arrow-down-line"
                prefix="icon"
                size={switcherIconEmbed.size ?? 1}
                className={switcherIconEmbed.class}
              />
            </span>
          ) : null
        }
        onNodeSelect={handleNodeSelect}
        onNodeExpand={handleNodeExpand}
        onUpdateSelectedKeys={onUpdateSelectedKeys}
        onUpdateExpandedKeys={onUpdateExpandedKeys}
      />
    </CW_TREE_STYLES_OVERRIDE_CONTEXT.Provider>
  )
}

export default CwNavigationTree
