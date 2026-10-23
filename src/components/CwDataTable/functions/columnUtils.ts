import type { CSSProperties } from 'react'
import type { CwDataTableColumn } from '../types'

/**
 * 判断是否为固定列
 */
export function isFixedColumn(column: CwDataTableColumn): boolean {
  return column.fixed === 'left' || column.fixed === 'right'
}

/**
 * 判断是否为第一个右侧固定列
 */
export function isFirstRightFixedColumn(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
): boolean {
  if (column.fixed !== 'right') return false

  const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
  // 检查前面是否有其他右侧固定列
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (visibleColumns[i]?.fixed === 'right') {
      return false
    }
  }
  return true
}

/**
 * 判断是否为最后一个左侧固定列（与非固定列相邻）
 */
export function isLastLeftFixedColumn(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
): boolean {
  if (column.fixed !== 'left') return false

  const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
  // 检查后面是否有非固定列
  for (let i = currentIndex + 1; i < visibleColumns.length; i++) {
    const fixed = visibleColumns[i]?.fixed
    if (!fixed) {
      return true // 后面有非固定列，说明这是最后一个左侧固定列
    }
    if (fixed === 'left') {
      return false // 后面还有左侧固定列
    }
  }
  return false
}

/**
 * 判断是否是最右侧的列
 */
export function isLastColumn(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
): boolean {
  const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
  return currentIndex === visibleColumns.length - 1
}

/**
 * 是否为「会贴表格右缘」的末列候选：
 * - 普通列中最右侧的非固定列
 * - 或整表最后一列且为右固定列
 */
export function isTrailingRightEdgeColumn(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
): boolean {
  const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
  if (currentIndex === -1) return false

  if (column.fixed === 'right') {
    return currentIndex === visibleColumns.length - 1
  }
  if (column.fixed) return false

  for (let i = visibleColumns.length - 1; i >= 0; i--) {
    if (!visibleColumns[i]!.fixed) return currentIndex === i
  }
  return false
}

/**
 * 判断是否应该移除右边框
 * 1. hideRightBorder: true → 始终移除
 * 2. 末列候选 + omitTrailingRightBorder（贴右缘无空隙时为 true）→ 移除，避免与外框叠线
 */
export function shouldRemoveRightBorder(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
  omitTrailingRightBorder = true,
): boolean {
  if (column.hideRightBorder) return true
  if (!isTrailingRightEdgeColumn(column, visibleColumns)) return false
  return omitTrailingRightBorder
}

/**
 * 获取列对齐样式类
 */
export function getColumnAlignClass(column: CwDataTableColumn): string {
  const align = column.align || 'left'
  if (align === 'center') return 'justify-center text-center'
  if (align === 'right') return 'justify-end text-right'
  return ''
}

/** 将列宽限制在 minWidth / maxWidth 配置范围内 */
export function clampColumnWidth(width: number, column: CwDataTableColumn): number {
  let w = width
  if (column.minWidth != null && column.minWidth > 0) {
    w = Math.max(w, column.minWidth)
  }
  if (column.maxWidth != null && column.maxWidth > 0) {
    w = Math.min(w, column.maxWidth)
  }
  return w
}

/** 显式声明 fill 的列（fill 优先于 width / maxWidth 锁死列宽） */
export function isExplicitFillColumn(column: CwDataTableColumn): boolean {
  return column.fill === true
}

/**
 * fill 列保底宽度：`minWidth` 与 `width` 取较大值。
 * `fill: true` 时 `width` 仅作保底，不参与固定列宽锁死。
 */
export function getFillColumnFloorWidth(column: CwDataTableColumn): number {
  let floor = 0
  if (column.minWidth != null && column.minWidth > 0) {
    floor = column.minWidth
  }
  if (column.width != null && column.width > 0) {
    floor = Math.max(floor, column.width)
  }
  return floor
}

function applyExplicitFillColumnStyle(
  column: CwDataTableColumn,
  expandFillColumns: boolean,
  style: CSSProperties,
): void {
  const floor = getFillColumnFloorWidth(column)
  const maxW =
    column.maxWidth != null && column.maxWidth > 0 ? column.maxWidth : undefined
  const grow =
    column.flex != null && Number.isFinite(column.flex) && column.flex > 0
      ? column.flex
      : 1

  if (expandFillColumns) {
    style.flex = `${grow} 1 0%`
    style.minWidth = floor > 0 ? `${floor}px` : '0'
    // 吃满剩余宽时不用 config maxWidth 卡住 flex，否则行末（操作列右侧）会留白
    style.maxWidth = '100%'
    return
  }

  // 未吃满剩余宽：仍按 fill 约束占位，避免 width:auto 被长内容撑爆整行
  const base = floor > 0 ? floor : 120
  const w = clampColumnWidth(base, column)
  style.flex = '0 0 auto'
  style.width = `${w}px`
  style.minWidth = `${w}px`
  style.maxWidth = maxW != null ? `${maxW}px` : `${w}px`
}

/**
 * 是否为按内容自适应、不参与 flex 拉伸的列
 */
export function isFitContentColumn(column: CwDataTableColumn): boolean {
  if (column.fill === true) return false
  if (column.width != null && column.width > 0) return false
  if (column.fitContent === true) return true
  return column.flex != null && Number.isFinite(column.flex) && column.flex === 0
}

/**
 * 是否参与 flex 拉伸以吃掉表格剩余宽度（含 `fill: true` 或未写死 width 的弹性列）
 */
export function isElasticFillColumn(column: CwDataTableColumn): boolean {
  if (isFitContentColumn(column)) return false
  if (column.fill === true) return true
  if (column.width != null && column.width > 0) return false
  const grow =
    column.flex != null && Number.isFinite(column.flex) ? column.flex : 1
  return grow > 0
}

/** 首个右侧固定列之前是否存在可拉伸的中间列 */
export function hasElasticFillInMiddleSection(
  visibleColumns: readonly CwDataTableColumn[],
): boolean {
  const firstRightIdx = visibleColumns.findIndex((c) => c.fixed === 'right')
  const end = firstRightIdx === -1 ? visibleColumns.length : firstRightIdx
  for (let i = 0; i < end; i++) {
    const col = visibleColumns[i]!
    if (col.fixed) continue
    if (isElasticFillColumn(col)) return true
  }
  return false
}

/**
 * 解析列在布局/固定列偏移计算中使用的有效宽度（px）
 */
export function getColumnResolvedWidth(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
): number {
  if (isExplicitFillColumn(column)) {
    return getFillColumnFloorWidth(column)
  }
  const measured = columnWidths[column.key]
  if (typeof measured === 'number' && Number.isFinite(measured) && measured > 0) {
    return measured
  }
  if (column.width != null && column.width > 0) return column.width
  if (column.minWidth != null && column.minWidth > 0) return column.minWidth
  return 0
}

export interface CalculateColumnStyleOptions {
  /** 为 true 时 fill/弹性列在容器内拉伸吃剩余宽度；为 false 时按内容参与 w-max 行宽 */
  expandFillColumns?: boolean
  /** 表体可视宽度。宽于各列下限之和时，把剩余空间按比例分给写了 width 的列 */
  layoutContainerWidth?: number
  /** 已算好的剩余宽度。传入后不再按列重算 */
  leftoverShares?: Readonly<Record<string, number>>
}

function baseLayoutWidth(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
): number {
  if (isExplicitFillColumn(column)) return getFillColumnFloorWidth(column)
  const measured = columnWidths[column.key]
  if (typeof measured === 'number' && Number.isFinite(measured) && measured > 0) {
    return clampColumnWidth(measured, column)
  }
  if (column.width != null && column.width > 0) return clampColumnWidth(column.width, column)
  if (column.minWidth != null && column.minWidth > 0) return column.minWidth
  return 0
}

/** 写了 width、未拖拽、非固定、非 fitContent：可以分到行内剩余宽度 */
function isLeftoverShareColumn(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
): boolean {
  if (column.fixed) return false
  if (isFitContentColumn(column) || isExplicitFillColumn(column)) return false
  if (!(column.width != null && column.width > 0)) return false
  const measured = columnWidths[column.key]
  if (typeof measured === 'number' && Number.isFinite(measured) && measured > 0) return false
  return true
}

/**
 * 容器比各列下限之和更宽时，把差额按 width 比例分给可拉伸列。
 * 整表只算一次，再按列取用，避免每个单元格都重扫全部列。
 * 用确定像素写回列宽，避免 flex-grow 跟内容最大宽度互相撑大，导致表头和表体错位。
 * 容器更窄时返回空表，列保持下限并横向滚动，不会被压成 0。
 */
export function computeLeftoverShares(
  visibleColumns: readonly CwDataTableColumn[] | undefined,
  columnWidths: Record<string, number>,
  containerWidth: number | undefined,
): Record<string, number> {
  if (!visibleColumns || !(containerWidth != null && containerWidth > 0)) return {}
  let locked = 0
  const shareable: { key: string; base: number }[] = []
  for (const col of visibleColumns) {
    const base = baseLayoutWidth(col, columnWidths)
    locked += base
    if (isLeftoverShareColumn(col, columnWidths) && base > 0) {
      shareable.push({ key: col.key, base })
    }
  }
  const extra = containerWidth - locked
  if (extra <= 0.5 || shareable.length === 0) return {}
  let weight = 0
  for (const item of shareable) weight += item.base
  const shares: Record<string, number> = {}
  let used = 0
  for (let index = 0; index < shareable.length; index++) {
    const item = shareable[index]!
    const part =
      index === shareable.length - 1
        ? Math.round((extra - used) * 100) / 100
        : Math.round(((extra * item.base) / weight) * 100) / 100
    shares[item.key] = Math.max(0, part)
    used += part
  }
  return shares
}

/**
 * 计算列样式
 */
export function calculateColumnStyle(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
  visibleColumns?: CwDataTableColumn[],
  options?: CalculateColumnStyleOptions,
): CSSProperties {
  const expandFillColumns = options?.expandFillColumns === true
  const elasticFill = isElasticFillColumn(column)
  const measuredWidth = columnWidths[column.key]
  const width =
    elasticFill
      ? undefined
      : typeof measuredWidth === 'number' && Number.isFinite(measuredWidth) && measuredWidth > 0
        ? measuredWidth
        : column.width
  const style: CSSProperties = {}

  if (isExplicitFillColumn(column)) {
    applyExplicitFillColumnStyle(column, expandFillColumns, style)
  } else if (width) {
    const shares =
      options?.leftoverShares ??
      computeLeftoverShares(visibleColumns, columnWidths, options?.layoutContainerWidth)
    const w = clampColumnWidth(width, column) + (shares[column.key] ?? 0)
    style.width = `${w}px`
    style.minWidth = `${w}px`
    style.maxWidth = `${w}px`
    style.flex = '0 0 auto'
  } else if (isFitContentColumn(column)) {
    // 先按内容占位，syncColumnWidthsFromBody 测量后再锁定像素宽
    style.flex = '0 0 auto'
    style.width = 'auto'
    if (column.minWidth) {
      style.minWidth = `${column.minWidth}px`
    }
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`
    }
  } else if (elasticFill && !expandFillColumns) {
    // 横滚模式：优先用已测量像素宽，保证表头/表体同列对齐
    const locked =
      typeof measuredWidth === 'number' && Number.isFinite(measuredWidth) && measuredWidth > 0
        ? clampColumnWidth(measuredWidth, column)
        : null
    style.flex = '0 0 auto'
    if (locked != null) {
      style.width = `${locked}px`
      style.minWidth = `${locked}px`
      style.maxWidth = `${locked}px`
    } else {
      style.width = 'auto'
      if (column.minWidth) {
        style.minWidth = `${column.minWidth}px`
      }
      if (column.maxWidth) {
        style.maxWidth = `${column.maxWidth}px`
      }
    }
  } else {
    // 弹性列：flex-basis:0% + min-width:0 允许在容器内收缩（长文本靠 cell truncate）；
    // 勿用 config minWidth 作硬性 min-width，否则 min-content 与 w-max 会把行撑出横向滚动。
    const grow =
      column.flex != null && Number.isFinite(column.flex) && column.flex > 0 ? column.flex : 1
    style.flex = `${grow} 1 0%`
    style.minWidth = '0'
    style.maxWidth = '100%'
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`
    }
  }

  // 计算固定列的 left 位置
  if (column.fixed === 'left' && visibleColumns) {
    const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
    let left = 0
    for (let i = 0; i < currentIndex; i++) {
      const prevCol = visibleColumns[i]
      if (prevCol?.fixed === 'left') {
        left += getColumnResolvedWidth(prevCol, columnWidths)
      }
    }
    // 始终设置 left，即使是 0，确保 sticky 定位生效
    style.left = `${left}px`
    // 清除对向 inset，避免在 flex 子项上与 right 同时参与计算导致错位（Chrome/Safari）
    style.right = 'auto'
    style.position = 'sticky'
  }

  // 计算固定列的 right 位置
  if (column.fixed === 'right' && visibleColumns) {
    const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
    let right = 0
    for (let i = visibleColumns.length - 1; i > currentIndex; i--) {
      const nextCol = visibleColumns[i]
      if (nextCol?.fixed === 'right') {
        right += getColumnResolvedWidth(nextCol, columnWidths)
      }
    }
    // 始终设置 right，即使是 0，确保 sticky 定位生效
    style.right = `${right}px`
    // 清除对向 inset，避免在 flex 子项上与 left 同时参与计算导致与中间列重叠
    style.left = 'auto'
    style.position = 'sticky'
    // 首个右侧固定列：无中间拉伸列、或未启用 fill 吃满时，用 margin-left:auto 把操作栏贴行末。
    if (
      isFirstRightFixedColumn(column, visibleColumns) &&
      (!hasElasticFillInMiddleSection(visibleColumns) || !expandFillColumns)
    ) {
      style.marginLeft = 'auto'
    }
  }

  return style
}

/**
 * 计算下一个排序状态
 */
export function calculateNextSortOrder(
  currentKey: string | undefined,
  currentOrder: 'asc' | 'desc' | undefined,
  columnKey: string,
): 'asc' | 'desc' | null {
  if (currentKey !== columnKey) {
    return 'asc'
  }

  if (currentOrder === 'asc') {
    return 'desc'
  }

  if (currentOrder === 'desc') {
    return null
  }

  return 'asc'
}

/**
 * 判断列是否升序排序
 */
export function isSortedAsc(
  column: CwDataTableColumn,
  sortState: { key: string; order: 'asc' | 'desc' } | undefined,
): boolean {
  return sortState?.key === column.key && sortState?.order === 'asc'
}

/**
 * 判断列是否降序排序
 */
export function isSortedDesc(
  column: CwDataTableColumn,
  sortState: { key: string; order: 'asc' | 'desc' } | undefined,
): boolean {
  return sortState?.key === column.key && sortState?.order === 'desc'
}

/**
 * 获取行键
 */
export function getRowKey(
  row: unknown,
  index: number,
  rowKey?: string,
): string | number {
  if (!row) return index
  if (!rowKey) return index
  const value = (row as Record<string, unknown>)[rowKey]
  if (typeof value === 'string' || typeof value === 'number') return value
  return index
}

/**
 * 拖拽列宽默认下限（见 columnResizePolicy / useColumnResize）。
 * ≤0 会被样式回退到 config.width，表现为「拖出窗口又弹回」。
 */
export const RESIZE_DEFAULT_MIN_COLUMN_WIDTH = 48

/**
 * 计算列宽（应用最小/最大限制；无 minWidth 时用 RESIZE_DEFAULT_MIN_COLUMN_WIDTH）
 */
export function calculateColumnWidth(
  startWidth: number,
  deltaX: number,
  minWidth?: number,
  maxWidth?: number,
): number {
  let newWidth = startWidth + deltaX
  const floor =
    minWidth != null && minWidth > 0 ? minWidth : RESIZE_DEFAULT_MIN_COLUMN_WIDTH
  newWidth = Math.max(newWidth, floor)
  if (maxWidth != null && maxWidth > 0) {
    newWidth = Math.min(newWidth, maxWidth)
  }
  return newWidth
}
