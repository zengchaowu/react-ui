import type { ReactNode } from 'react'

/**
 * React 版内容解析：默认插槽内容直接渲染（无 VNode 转换）。
 */
export function resolvePopupContent(content: ReactNode): ReactNode {
  return content
}
