import type { CwTreeNode } from '../CwTree/types'

function nodeMatchesQuery(node: CwTreeNode, query: string): boolean {
  const label = String(node.label ?? '').toLowerCase()
  if (label.includes(query)) return true
  return (node.children ?? []).some((child) => nodeMatchesQuery(child, query))
}

function filterNode(node: CwTreeNode, query: string): CwTreeNode | null {
  const label = String(node.label ?? '').toLowerCase()
  const selfMatch = label.includes(query)
  const children = (node.children ?? [])
    .map((child) => filterNode(child, query))
    .filter((child): child is CwTreeNode => child != null)

  if (selfMatch || children.length) {
    return {
      ...node,
      children: children.length ? children : node.children,
    }
  }
  return null
}

export function filterDesignLayerTree(
  nodes: CwTreeNode[],
  rawQuery: string,
): CwTreeNode[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return nodes
  return nodes
    .map((node) => filterNode(node, query))
    .filter((node): node is CwTreeNode => node != null)
}

export function designLayerTreeHasMatch(
  nodes: CwTreeNode[],
  rawQuery: string,
): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return nodes.length > 0
  return nodes.some((node) => nodeMatchesQuery(node, query))
}
