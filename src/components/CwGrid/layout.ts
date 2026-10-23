/** 栅格断点属性（与 vue-ui `CwRow/types.ts` 一致） */
export interface CwColBreakpointProps {
  /** 栅格占位格数，为 0 时相当于 display: none */
  span?: number
  /** 栅格左侧的间隔格数 */
  offset?: number
  /** 栅格向右移动格数 */
  push?: number
  /** 栅格向左移动格数 */
  pull?: number
}

export interface CwColProps {
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象。作为最小断点，必填 */
  xs: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  sm?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  md?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  lg?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  xl?: number | CwColBreakpointProps
}

/** 24 栅格制总份数 */
export const GRID_SPAN_TOTAL = 24

export const GRID_COL_BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export type GridColBreakpointKey = (typeof GRID_COL_BREAKPOINT_KEYS)[number]

/** 栅格容器宽度断点（ResizeObserver 实测，与 CwGrid / CwRow @container 一致） */
export const CW_CONTAINER_MIN_WIDTH = {
  sm: 400,
  md: 480,
  lg: 1024,
  xl: 1280,
} as const

function resolveSpanValue(value: CwColProps[GridColBreakpointKey]): number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return value
  return value.span
}

/** 按容器实测宽度解析当前断点键 */
export function getContainerBreakpointKey(width: number): GridColBreakpointKey {
  if (width >= CW_CONTAINER_MIN_WIDTH.xl) return 'xl'
  if (width >= CW_CONTAINER_MIN_WIDTH.lg) return 'lg'
  if (width >= CW_CONTAINER_MIN_WIDTH.md) return 'md'
  if (width >= CW_CONTAINER_MIN_WIDTH.sm) return 'sm'
  return 'xs'
}

/** 构建各断点级联后的 span（未显式配置时沿用更小断点） */
export function buildCascadedSpanMap(
  colProps: CwColProps,
): Partial<Record<GridColBreakpointKey, number>> {
  const map: Partial<Record<GridColBreakpointKey, number>> = {}
  let lastSpan: number | undefined

  for (const key of GRID_COL_BREAKPOINT_KEYS) {
    const span = resolveSpanValue(colProps[key])
    if (span !== undefined) lastSpan = span
    if (lastSpan !== undefined) map[key] = lastSpan
  }

  return map
}

/** 按栅格容器实测宽度解析当前 span */
export function resolveColSpanFromContainerWidth(width: number, colProps: CwColProps): number {
  const cascaded = buildCascadedSpanMap(colProps)
  const bp = getContainerBreakpointKey(width)
  const bpIndex = GRID_COL_BREAKPOINT_KEYS.indexOf(bp)

  for (let i = bpIndex; i >= 0; i--) {
    const breakpointKey = GRID_COL_BREAKPOINT_KEYS[i]
    if (!breakpointKey) continue
    const span = cascaded[breakpointKey]
    if (span !== undefined) return span
  }

  return GRID_SPAN_TOTAL
}

export function columnsToSpan(columns: number): number {
  if (columns <= 0) return GRID_SPAN_TOTAL
  return GRID_SPAN_TOTAL / columns
}

export function spanToPercent(span: number): string {
  return `${(span / GRID_SPAN_TOTAL) * 100}%`
}

/**
 * Row 使用 column-gap 时，百分比宽须扣 gap，否则半行+半行+间距 > 100% 会被迫换行。
 * span=12,gap=12 → calc(50% - 6px)；span=24 → 100%。
 */
export function spanToColumnGapAwareWidth(span: number, gutter: number): string {
  if (span >= GRID_SPAN_TOTAL) return '100%'
  if (gutter <= 0) return spanToPercent(span)
  const ratio = span / GRID_SPAN_TOTAL
  return `calc(${ratio * 100}% - ${gutter * (1 - ratio)}px)`
}

export function columnsToPercentWidth(columns: number): string {
  return spanToPercent(columnsToSpan(columns))
}

function applySpanToStyle(
  style: Record<string, string>,
  breakpoint: GridColBreakpointKey,
  span: number,
  columnGapGutter = 0,
): void {
  const width =
    columnGapGutter > 0
      ? spanToColumnGapAwareWidth(span, columnGapGutter)
      : spanToPercent(span)
  style[`--${breakpoint}-width`] = width
}

function applyBreakpointObjectToStyle(
  style: Record<string, string>,
  breakpoint: GridColBreakpointKey,
  config: CwColBreakpointProps,
  columnGapGutter = 0,
): void {
  if (config.span !== undefined) {
    applySpanToStyle(style, breakpoint, config.span, columnGapGutter)
  }
  if (config.offset !== undefined) {
    style[`--${breakpoint}-margin-left`] = spanToPercent(config.offset)
  }
  if (config.push !== undefined) {
    style[`--${breakpoint}-left`] = spanToPercent(config.push)
    style[`--${breakpoint}-position`] = 'relative'
  }
  if (config.pull !== undefined) {
    style[`--${breakpoint}-right`] = spanToPercent(config.pull)
    style[`--${breakpoint}-position`] = 'relative'
  }
}

/** 为 CwCol 生成内联样式（gutter padding + 断点 CSS 变量） */
export function buildColInlineStyle(
  props: CwColProps,
  gutter?: number,
  options?: { columnGap?: boolean },
): Record<string, string> {
  const style: Record<string, string> = {}
  const useColumnGap = options?.columnGap === true
  const columnGapGutter = useColumnGap ? (gutter ?? 0) : 0

  // column-gap 模式由 Row 承担间距，Col 不再左右 padding
  if (gutter && !useColumnGap) {
    const half = gutter / 2
    style.paddingLeft = `${half}px`
    style.paddingRight = `${half}px`
  }

  // span 向更大断点级联，避免 @container 命中 lg/xl 时 --lg-width 等未定义而回退到 xs
  let lastSpan: number | undefined

  for (const key of GRID_COL_BREAKPOINT_KEYS) {
    const value = props[key]
    if (value !== undefined) {
      if (typeof value === 'number') {
        lastSpan = value
        applySpanToStyle(style, key, value, columnGapGutter)
      } else {
        applyBreakpointObjectToStyle(style, key, value, columnGapGutter)
        if (value.span !== undefined) lastSpan = value.span
      }
    } else if (lastSpan !== undefined) {
      applySpanToStyle(style, key, lastSpan, columnGapGutter)
    }
  }

  return style
}

/**
 * CwGrid 实测模式列宽：扣除 column-gap，避免 20%×N + 间距撑出横向滚动。
 */
export function measuredColFlexBasis(columns: number, gutter: number): string {
  if (columns <= 0) return '100%'
  if (columns === 1) return '100%'
  if (gutter <= 0) return `${100 / columns}%`
  const gapTotal = (columns - 1) * gutter
  return `calc((100% - ${gapTotal}px) / ${columns})`
}

/** CwGrid 实测列：flex 占位（配合 Row column-gap，无左右 padding） */
export function buildMeasuredColInlineStyle(
  columns: number,
  gutter: number,
): Record<string, string> {
  const basis = measuredColFlexBasis(columns, gutter)
  return {
    flex: `0 0 ${basis}`,
    maxWidth: basis,
    width: basis,
  }
}
