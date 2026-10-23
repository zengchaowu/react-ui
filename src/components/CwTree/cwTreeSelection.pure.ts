import type { CwTreeNode } from './types'

function isNodeSelectable(
  node: CwTreeNode,
  folderSelectable: boolean,
): boolean {
  if (node.disabled) return false
  const hasChildren = Boolean(node.children && node.children.length > 0)
  if (hasChildren && !folderSelectable) return false
  return true
}

/** 按视觉顺序收集当前展开可见、且可选中的节点 key（用于 Shift 范围多选）。 */
export function collectVisibleSelectableKeys(
  nodes: CwTreeNode[],
  expandedKeys: Set<string | number>,
  folderSelectable: boolean,
): (string | number)[] {
  const out: (string | number)[] = []

  const walk = (list: CwTreeNode[]) => {
    for (const node of list) {
      if (isNodeSelectable(node, folderSelectable)) {
        out.push(node.key)
      }
      const kids = node.children
      if (kids?.length && expandedKeys.has(node.key)) {
        walk(kids)
      }
    }
  }

  walk(nodes)
  return out
}

/** 多选：单击替换；Ctrl/Cmd 切换；Shift 从锚点到当前做范围选。 */
export function resolveTreeMultiSelectKeys(options: {
  clickedKey: string | number
  event: Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>
  currentKeys: (string | number)[]
  visibleSelectableKeys: (string | number)[]
  selectionAnchorKey: string | number | null
}): (string | number)[] {
  const {
    clickedKey,
    event,
    currentKeys,
    visibleSelectableKeys: flat,
    selectionAnchorKey,
  } = options

  if (event.shiftKey) {
    const anchor = selectionAnchorKey ?? clickedKey
    const ai = flat.indexOf(anchor)
    const bi = flat.indexOf(clickedKey)
    if (ai < 0 || bi < 0) return [clickedKey]
    const lo = Math.min(ai, bi)
    const hi = Math.max(ai, bi)
    return flat.slice(lo, hi + 1)
  }

  if (event.ctrlKey || event.metaKey) {
    const next = new Set(currentKeys)
    if (next.has(clickedKey)) next.delete(clickedKey)
    else next.add(clickedKey)
    return Array.from(next)
  }

  return [clickedKey]
}
