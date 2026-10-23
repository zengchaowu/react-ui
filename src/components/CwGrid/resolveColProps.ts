import { useMemo } from 'react'
import type { CwGridBreakpointConfig } from './types'
import type { CwColBreakpointProps, GridColBreakpointKey } from './layout'
import { columnsToSpan, GRID_COL_BREAKPOINT_KEYS } from './layout'

function inheritColumns(
  breakpoints: CwGridBreakpointConfig | undefined,
  key: GridColBreakpointKey,
  fallback: number,
): number {
  const direct = breakpoints?.[key]?.columns
  if (direct) return direct
  const idx = GRID_COL_BREAKPOINT_KEYS.indexOf(key)
  for (let i = idx - 1; i >= 0; i--) {
    const breakpointKey = GRID_COL_BREAKPOINT_KEYS[i]
    if (!breakpointKey) continue
    const inherited = breakpoints?.[breakpointKey]?.columns
    if (inherited) return inherited
  }
  return fallback
}

export function resolveStaticColProps(
  breakpoint: GridColBreakpointKey,
  breakpoints: CwGridBreakpointConfig | undefined,
  fallbackColumns: number,
): number | CwColBreakpointProps {
  const config = breakpoints?.[breakpoint]
  if (config) {
    const span = columnsToSpan(config.columns)
    if (config.colConfig) {
      return { span, ...config.colConfig }
    }
    return span
  }
  return columnsToSpan(inheritColumns(breakpoints, breakpoint, fallbackColumns))
}

export interface UseGridColBindingsOptions {
  breakpoints?: CwGridBreakpointConfig
  fallbackColumns: number
  usesMeasuredLayout: boolean
  measuredSpan: number
}

/** 构建传给 CwCol 的 xs/sm/md/lg/xl 绑定（React 版 `useGridColBindings`） */
export function useGridColBindings(
  options: UseGridColBindingsOptions,
): Record<GridColBreakpointKey, number | CwColBreakpointProps> {
  const { breakpoints, fallbackColumns, usesMeasuredLayout, measuredSpan } = options

  return useMemo(() => {
    const bindings = {} as Record<GridColBreakpointKey, number | CwColBreakpointProps>
    for (const key of GRID_COL_BREAKPOINT_KEYS) {
      bindings[key] = usesMeasuredLayout
        ? measuredSpan
        : resolveStaticColProps(key, breakpoints, fallbackColumns)
    }
    return bindings
  }, [breakpoints, fallbackColumns, usesMeasuredLayout, measuredSpan])
}
