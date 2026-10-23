import type { CwGridBreakpointConfig } from './types'

/** CwGrid 容器宽度断点（ResizeObserver 实测栅格根节点，非视口） */
export const CW_GRID_CONTAINER_MIN_WIDTH = {
  sm: 400,
  md: 480,
  lg: 1024,
  xl: 1280,
} as const

const RESOLVE_ORDER = [
  { key: 'xl' as const, minWidth: CW_GRID_CONTAINER_MIN_WIDTH.xl },
  { key: 'lg' as const, minWidth: CW_GRID_CONTAINER_MIN_WIDTH.lg },
  { key: 'md' as const, minWidth: CW_GRID_CONTAINER_MIN_WIDTH.md },
  { key: 'sm' as const, minWidth: CW_GRID_CONTAINER_MIN_WIDTH.sm },
]

/** 按栅格容器实测宽度解析 breakpoints 列数 */
export function resolveGridColumnsFromContainerWidth(
  width: number,
  breakpoints: CwGridBreakpointConfig,
  fallback = 3,
): number {
  for (const { key, minWidth } of RESOLVE_ORDER) {
    const columns = breakpoints[key]?.columns
    if (width >= minWidth && columns) return columns
  }
  return breakpoints.xs?.columns ?? fallback
}
