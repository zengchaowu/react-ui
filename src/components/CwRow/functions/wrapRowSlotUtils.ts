import { Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'
import type { CwColProps } from '@zengchaowu/ui-shared/components/CwRow/types'
import { GRID_SPAN_TOTAL } from '@zengchaowu/ui-shared/components/CwRow/layout'

/** 展开数组 / Fragment，得到扁平子节点列表 */
export function flattenReactNodes(node: ReactNode): ReactNode[] {
  const out: ReactNode[] = []
  const walk = (current: ReactNode) => {
    if (current == null || typeof current === 'boolean') return
    if (Array.isArray(current)) {
      current.forEach(walk)
      return
    }
    if (isValidElement<{ children?: ReactNode }>(current) && current.type === Fragment) {
      walk(current.props.children)
      return
    }
    out.push(current)
  }
  walk(node)
  return out
}

/** 具名插槽是否有实质内容（忽略 null / 空文本 / 空 Fragment） */
export function slotHasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false
  if (typeof node === 'string') return node.trim().length > 0
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some((item) => slotHasContent(item))
  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === Fragment) return slotHasContent(node.props.children)
    return true
  }
  return true
}

/** 由列 span 配置得到每行可放几项 */
export function resolveItemsPerRowFromColProps(
  colProps: number | { span?: number } | undefined,
): number {
  let span = GRID_SPAN_TOTAL
  if (typeof colProps === 'number') span = colProps
  else if (colProps && typeof colProps.span === 'number') span = colProps.span
  return Math.max(1, Math.floor(GRID_SPAN_TOTAL / span))
}

/** 折叠时若有 controls，预留行末一格 */
export function resolveMaxVisibleItems(
  maxRows: number,
  itemsPerRow: number,
  hasControls: boolean,
): number {
  const maxItems = Math.max(0, maxRows) * Math.max(1, itemsPerRow)
  return hasControls ? Math.max(0, maxItems - 1) : maxItems
}

export type { CwColProps }
