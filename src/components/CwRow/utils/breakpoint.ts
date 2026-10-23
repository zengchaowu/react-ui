/**
 * 响应式断点工具函数
 */


export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 断点配置
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
} as const

/**
 * 根据窗口宽度获取当前断点
 * @param width 窗口宽度
 * @returns 当前断点
 */
export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.xl) {
    return 'xl'
  } else if (width >= BREAKPOINTS.lg) {
    return 'lg'
  } else if (width >= BREAKPOINTS.md) {
    return 'md'
  } else if (width >= BREAKPOINTS.sm) {
    return 'sm'
  } else {
    return 'xs'
  }
}

/**
 * 获取当前窗口的断点
 * @returns 当前断点
 */
export function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth || 1024
  return getBreakpoint(width)
}

/**
 * 断点优先级顺序（从大到小）
 */
export const BREAKPOINT_ORDER: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs']

/**
 * 根据当前断点查找匹配的配置
 * @param config 包含断点配置的对象
 * @param currentBreakpoint 当前断点
 * @returns 匹配的配置值
 */
export function findBreakpointConfig<T>(
  config: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint
): T | undefined {
  const currentIndex = BREAKPOINT_ORDER.indexOf(currentBreakpoint)
  
  for (let i = currentIndex; i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i]
    if (config[bp] !== undefined) {
      return config[bp]
    }
  }
  
  return undefined
}
