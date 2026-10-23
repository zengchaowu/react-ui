import { Fragment, isValidElement, type ReactNode } from 'react'

type NodeWithChildren = {
  props?: { children?: ReactNode }
}

function flattenNodes(nodes: ReactNode, out: ReactNode[]): void {
  if (nodes == null || typeof nodes === 'boolean') return
  if (Array.isArray(nodes)) {
    for (const node of nodes) flattenNodes(node, out)
    return
  }
  if (typeof nodes === 'string') {
    if (nodes.trim().length > 0) out.push(nodes)
    return
  }
  if (typeof nodes === 'number') {
    out.push(nodes)
    return
  }
  if (!isValidElement(nodes)) return
  if (nodes.type === Fragment) {
    flattenNodes((nodes as unknown as NodeWithChildren).props?.children, out)
    return
  }
  out.push(nodes)
}

/** CwCol 列表项 key：优先用子节点 key（如列表 map 的 key），避免过滤后按 index 错绑 */
export function gridSlotNodeKey(node: ReactNode, index: number): string | number {
  if (isValidElement(node)) {
    const key = node.key
    if (typeof key === 'string' && key !== '') return key
    if (typeof key === 'number') return key
  }
  return index
}

/** 展开 children（含 Fragment / 数组）为扁平节点列表 */
export function flattenSlotNodes(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = []
  flattenNodes(children, out)
  return out
}
