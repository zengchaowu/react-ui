import { createContext, useContext } from 'react'
import type { CwTreeNode } from './types'

/** 懒加载：子节点点击展开时由 CwTree 提供，各层 CwTreeNode 消费 */
export type CwTreeLazyContext = {
  tryExpandAndThen: (node: CwTreeNode) => Promise<boolean>
  isLoadingKey: (key: string | number) => boolean
  /** 是否传入 `loadData`（与懒加载分支的展开箭头有关） */
  loadDataEnabled: boolean
}

export const CW_TREE_LAZY_CONTEXT =
  createContext<CwTreeLazyContext | null>(null)

export function useCwTreeLazyContext(): CwTreeLazyContext | null {
  return useContext(CW_TREE_LAZY_CONTEXT)
}

export function isLazyBranchPending(
  node: CwTreeNode,
  hasLoadData: boolean,
  hasCachedChildren: (key: string) => boolean,
): boolean {
  if (!hasLoadData) return false
  if (node.isLeaf === true) return false
  if (node.isLeaf !== false) return false
  if (hasCachedChildren(String(node.key))) return false
  return node.children === undefined
}

export function isExpandable(
  loadDataEnabled: boolean,
  node: CwTreeNode,
  hasCachedChildren: (key: string) => boolean,
): boolean {
  const count = node.children?.length ?? 0
  if (count > 0) return true
  if (node.children && node.children.length === 0) return true
  return isLazyBranchPending(node, loadDataEnabled, hasCachedChildren)
}
