import type { CwTreeNode, CwTreeSize } from '../types'

/** 按展开状态展平后的可见行（虚拟滚动用） */
export type CwTreeFlatRow = {
  node: CwTreeNode
  level: number
  parentPath: (string | number)[]
}

/**
 * 按 expandedKeys 将树拍平为可见行列表。
 * 懒加载尚未写入 children 的分支只占一行；展开且已有 children 时递归展开。
 */
export function flattenVisibleTreeRows(
  nodes: CwTreeNode[],
  expandedKeys: Set<string | number>,
  options?: { level?: number; parentPath?: (string | number)[] },
): CwTreeFlatRow[] {
  const level = options?.level ?? 0
  const parentPath = options?.parentPath ?? []
  const out: CwTreeFlatRow[] = []

  for (const node of nodes) {
    out.push({ node, level, parentPath })
    const kids = node.children
    if (kids && kids.length > 0 && expandedKeys.has(node.key)) {
      out.push(
        ...flattenVisibleTreeRows(kids, expandedKeys, {
          level: level + 1,
          parentPath: [...parentPath, node.key],
        }),
      )
    }
  }

  return out
}

/** 与 CwTree size 样式 min-h 对齐的固定行高（虚拟滚动） */
export function treeVirtualRowHeight(
  size: CwTreeSize = 'medium',
): number {
  switch (size) {
    case 'small':
      return 24
    case 'large':
      return 44
    default:
      return 36
  }
}
