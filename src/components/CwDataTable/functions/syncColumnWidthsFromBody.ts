import type { CwDataTableColumn } from '../types'
import {
  clampColumnWidth,
  getColumnResolvedWidth,
  getFillColumnFloorWidth,
  hasElasticFillInMiddleSection,
  isElasticFillColumn,
  isExplicitFillColumn,
  isFitContentColumn,
} from './columnUtils'

const WIDTH_EPSILON = 0.25
/** 多列时单列超过该行宽度此比例，视为 flex 尚未分配完毕 */
const SINGLE_COLUMN_DOMINANCE_RATIO = 0.85
/** 测量异常兜底：避免错误 DOM 节点导致列宽正反馈撑爆 */
const MAX_REASONABLE_COLUMN_WIDTH = 16_384

function isReasonableColumnWidth(w: number, bodyRoot?: HTMLElement | null): boolean {
  if (!isPositiveWidth(w) || w > MAX_REASONABLE_COLUMN_WIDTH) return false
  const cw = bodyRoot?.clientWidth ?? 0
  // 单列可以宽于表体（markdown 表靠横向滚动看右侧列）。
  // 同时远超表体、且超过 2000px，才视为量到了错误节点。
  if (cw > 0 && w > cw * 3 && w > 2000) return false
  return true
}

function isTableDataRow(el: HTMLElement): boolean {
  return el.classList.contains('group')
}

function isTableScrollContent(el: HTMLElement): boolean {
  return el.classList.contains('w-max') || el.classList.contains('max-w-full')
}

/**
 * 表体滚动根下承载数据行的 scrollContent 容器。
 * CwDiv：viewport → content → 内层（padding / 撑高）→ scrollContent。
 * 旧结构：根 → scrollContent。内层不能当成数据行，否则 fitContent 会量到整行宽。
 */
export function getBodyTableScrollRoot(
  bodyRoot: HTMLElement | null | undefined,
): HTMLElement | null {
  if (!bodyRoot) return null
  let scroll = bodyRoot.firstElementChild as HTMLElement | null
  if (!scroll) return null
  if (scroll.classList.contains('cw-div__content')) {
    scroll = scroll.firstElementChild as HTMLElement | null
  }
  if (!scroll) return null
  if (scroll.children.length === 1 && !isTableDataRow(scroll.children[0] as HTMLElement)) {
    const only = scroll.children[0] as HTMLElement
    let onlyHasRow = false
    for (let i = 0; i < only.children.length; i++) {
      if (isTableDataRow(only.children[i] as HTMLElement)) {
        onlyHasRow = true
        break
      }
    }
    if (onlyHasRow || isTableScrollContent(only)) {
      scroll = only
    }
  }
  return scroll
}

export interface SyncColumnWidthsFromBodyOptions {
  /**
   * true：仅对「列配置里未写死 width」的列写入测量值（弹性列由表体决定像素宽）。
   * false：每一列都以表体该单元格的测量值为准写入 columnWidths（表头与表体强制同宽）。
   * @default true
   */
  onlyWhenColumnHasNoWidth?: boolean
  /** 为 false 时横滚占位，弹性列也需测量锁定像素宽 */
  expandFillColumns?: boolean
  /** 表头行 */
  headerRow?: HTMLElement | null
  /** 全部表体数据行（用于 fitContent 列取同列最大宽） */
  bodyRows?: readonly HTMLElement[]
}

function roundCssPx(w: number): number {
  return Math.round(w * 100) / 100
}

function isPositiveWidth(w: unknown): w is number {
  return typeof w === 'number' && Number.isFinite(w) && w > 0
}

function shouldSkipColumnSync(
  col: CwDataTableColumn,
  onlyFlexible: boolean,
  expandFillColumns?: boolean,
): boolean {
  if (!onlyFlexible) return false
  // 吃满剩余宽时弹性列继续 flex，不锁像素宽；横滚模式下需测量锁定以对齐表头/表体
  if (isElasticFillColumn(col) && expandFillColumns !== false) return true
  if (col.width != null && col.width > 0) return true
  // fitContent 列由专用测量逻辑处理，避免被弹性列同步覆盖
  if (isFitContentColumn(col)) return true
  return false
}

function readHorizontalBoxExtras(el: HTMLElement): number {
  const style = getComputedStyle(el)
  const pl = parseFloat(style.paddingLeft) || 0
  const pr = parseFloat(style.paddingRight) || 0
  const bl = parseFloat(style.borderLeftWidth) || 0
  const br = parseFloat(style.borderRightWidth) || 0
  return pl + pr + bl + br
}

/**
 * 测量单元格在「按内容占位」阶段所需宽度。
 * 同时参考当前占位宽度与内容固有宽度，取较大值，避免各行初始宽度不一致。
 */
function measureCellFitContentWidth(cell: HTMLElement, bodyRoot?: HTMLElement | null): number {
  const layoutWidth = cell.getBoundingClientRect().width
  const content = cell.firstElementChild as HTMLElement | null
  if (!content) {
    const w = roundCssPx(layoutWidth)
    return isReasonableColumnWidth(w, bodyRoot) ? w : 0
  }

  const extras = readHorizontalBoxExtras(cell)
  // 量包装层整盒，而不是第一个子节点：一格里多段行内内容不会只量到第一段。
  // 用边框盒而不是 scrollWidth 再加 padding，避免列宽被写成测量值后下一帧继续变宽。
  const intrinsicWidth = content.getBoundingClientRect().width + extras
  const w = roundCssPx(Math.max(layoutWidth, intrinsicWidth))
  return isReasonableColumnWidth(w, bodyRoot) ? w : 0
}

/**
 * fitContent 列：扫描表头 + 所有表体行，取同列最大宽度，保证表头/表体/各行像素一致。
 */
/**
 * 注意：虚拟滚动时仅测量当前挂载行，离屏更宽单元格无法参与 max 宽度。
 * 虚滚场景下 fitContent 列宽以可视行样本为准。
 */
export function measureFitContentColumnWidths(
  headerRow: HTMLElement | null | undefined,
  bodyRows: readonly HTMLElement[],
  visibleColumns: readonly CwDataTableColumn[],
  bodyRoot?: HTMLElement | null,
): Record<string, number> {
  const out: Record<string, number> = {}
  if (bodyRows.length === 0 && !headerRow) return out

  const rows: HTMLElement[] = []
  if (headerRow) rows.push(headerRow)
  rows.push(...bodyRows)

  for (let colIndex = 0; colIndex < visibleColumns.length; colIndex++) {
    const col = visibleColumns[colIndex]!
    if (!isFitContentColumn(col)) continue

    let maxW = 0
    for (const row of rows) {
      const cell = row.children[colIndex] as HTMLElement | undefined
      if (!cell) continue
      const w = measureCellFitContentWidth(cell, bodyRoot)
      if (w > maxW) maxW = w
    }

    maxW = clampColumnWidth(maxW, col)
    if (isPositiveWidth(maxW)) {
      out[col.key] = maxW
    }
  }

  return out
}

/** 列 key 序列，用于检测 visibleColumns 结构是否变化 */
export function columnKeysSignature(columns: readonly { key: string }[]): string {
  return columns.map((c) => c.key).join('\0')
}

/**
 * 从表体某一完整数据行测量各列单元格的 border-box 宽度（与 `getBoundingClientRect()` 一致）。
 * 要求：`bodyRow` 的直接子节点顺序与 `visibleColumns` 一致，且数量相同。
 *
 * @returns `columnKey -> 宽度(px)`；无法测量时返回 `null`（无行、子节点数量不一致等）
 */
export function measureColumnWidthsFromBodyRow(
  bodyRow: HTMLElement | null | undefined,
  visibleColumns: readonly CwDataTableColumn[],
  bodyRoot?: HTMLElement | null,
): Record<string, number> | null {
  if (!bodyRow || visibleColumns.length === 0) return null

  const cells = Array.from(bodyRow.children) as HTMLElement[]
  if (cells.length !== visibleColumns.length) return null

  const out: Record<string, number> = {}
  for (let i = 0; i < visibleColumns.length; i++) {
    const w = roundCssPx(cells[i]!.getBoundingClientRect().width)
    if (!isReasonableColumnWidth(w, bodyRoot)) return null
    out[visibleColumns[i]!.key] = w
  }
  return out
}

/**
 * 多列时若单列已占满整行，说明 flex 尚未分配完毕（另一列仍为 0 宽或未参与布局），
 * 此时写入会把首列固定为 ~100% 容器宽，第二列被挤到视口外需横向滚动。
 */
function isMultiColumnLayoutSettled(
  bodyRow: HTMLElement,
  columnCount: number,
  maxMeasuredWidth: number,
): boolean {
  if (columnCount <= 1) return true
  const rowWidth = bodyRow.getBoundingClientRect().width
  return rowWidth <= 0 || maxMeasuredWidth <= rowWidth * SINGLE_COLUMN_DOMINANCE_RATIO
}

function collectSyncableWidths(
  measured: Record<string, number>,
  visibleColumns: readonly CwDataTableColumn[],
  onlyFlexible: boolean,
  expandFillColumns?: boolean,
): { pending: Record<string, number>; maxWidth: number } | null {
  const pending: Record<string, number> = {}
  let maxWidth = 0

  for (const col of visibleColumns) {
    if (shouldSkipColumnSync(col, onlyFlexible, expandFillColumns)) continue
    const w = measured[col.key]
    // 布局未就绪时（流式 Markdown / 折叠动画等）常出现部分单元格 0 宽
    if (!isPositiveWidth(w)) return null
    pending[col.key] = w
    if (w > maxWidth) maxWidth = w
  }

  return Object.keys(pending).length > 0 ? { pending, maxWidth } : null
}

function applyColumnWidthUpdates(
  pending: Record<string, number>,
  columnWidths: Record<string, number>,
  visibleColumns?: readonly CwDataTableColumn[],
): boolean {
  const colMap = visibleColumns
    ? new Map(visibleColumns.map((c) => [c.key, c]))
    : null
  let wrote = false
  for (const [key, w] of Object.entries(pending)) {
    const col = colMap?.get(key)
    const next = col ? clampColumnWidth(w, col) : w
    const prev = columnWidths[key]
    if (prev != null && Math.abs(prev - next) < WIDTH_EPSILON) continue
    columnWidths[key] = next
    wrote = true
  }
  return wrote
}

/** 单列内容基线上限：再长就换行，避免一个单元格把横向滚动撑得过宽 */
const BOUNDED_FIT_COLUMN_MAX = 280
/** 窄容器里单列最多占这么多，给其余列留位置 */
const BOUNDED_FIT_COLUMN_VIEWPORT_RATIO = 0.6

function columnContentCap(containerWidth: number): number {
  return Math.min(
    BOUNDED_FIT_COLUMN_MAX,
    Math.max(72, containerWidth * BOUNDED_FIT_COLUMN_VIEWPORT_RATIO),
  )
}

/** 离屏测量不换行宽度。单元格里的文字是换行排版，不能用当前布局宽。 */
function measureUnwrappedCellWidth(cell: HTMLElement): number {
  const content = cell.firstElementChild as HTMLElement | null
  const extras = readHorizontalBoxExtras(cell)
  if (!content || typeof document === 'undefined') {
    return roundCssPx(cell.getBoundingClientRect().width)
  }
  const clone = content.cloneNode(true) as HTMLElement
  clone.style.cssText =
    'position:fixed;left:-10000px;top:0;width:max-content;max-width:none;white-space:nowrap;visibility:hidden;pointer-events:none;'
  document.body.appendChild(clone)
  const width = clone.getBoundingClientRect().width + extras
  clone.remove()
  return roundCssPx(width)
}

/**
 * Markdown 表：列基线 = min(不换行宽, 上限)。
 * 基线之和不超过容器时按比例铺满；超出则停在基线上并横向滚动。
 * 基线来自离屏测量，不会把已经铺满的列宽再记回去。
 */
export function layoutBoundedFitColumns(
  headerRow: HTMLElement | null | undefined,
  bodyRows: readonly HTMLElement[],
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  containerWidth: number,
): boolean {
  if (!(containerWidth > 0)) return false
  const rows: HTMLElement[] = []
  if (headerRow) rows.push(headerRow)
  rows.push(...bodyRows)
  if (rows.length === 0) return false

  const cap = columnContentCap(containerWidth)
  const pending: Record<string, number> = {}
  const keys: string[] = []

  for (let colIndex = 0; colIndex < visibleColumns.length; colIndex++) {
    const col = visibleColumns[colIndex]!
    if (!isFitContentColumn(col)) continue
    let maxW = 0
    for (const row of rows) {
      const cell = row.children[colIndex] as HTMLElement | undefined
      if (!cell) continue
      const w = measureUnwrappedCellWidth(cell)
      if (w > maxW) maxW = w
    }
    const basis = Math.min(Math.max(maxW, 0), cap)
    if (!isPositiveWidth(basis)) continue
    pending[col.key] = roundCssPx(basis)
    keys.push(col.key)
  }
  if (keys.length === 0) return false

  let sum = 0
  for (const key of keys) sum += pending[key]!
  if (sum > 0 && sum < containerWidth - WIDTH_EPSILON) {
    const scale = containerWidth / sum
    let assigned = 0
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        pending[key] = roundCssPx(containerWidth - assigned)
        return
      }
      const w = roundCssPx(pending[key]! * scale)
      pending[key] = w
      assigned += w
    })
  }

  return applyColumnWidthUpdates(pending, columnWidths, visibleColumns)
}

export function syncFitContentColumnWidths(
  headerRow: HTMLElement | null | undefined,
  bodyRows: readonly HTMLElement[],
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  bodyRoot?: HTMLElement | null,
): boolean {
  const pending = measureFitContentColumnWidths(headerRow, bodyRows, visibleColumns, bodyRoot)
  return applyColumnWidthUpdates(pending, columnWidths, visibleColumns)
}

/** 同步弹性列（flex）宽：依赖表体首行布局，fitContent 列不在此处理 */
export function syncFlexColumnWidthsFromBodyRow(
  bodyRow: HTMLElement | null | undefined,
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  options?: Pick<
    SyncColumnWidthsFromBodyOptions,
    'onlyWhenColumnHasNoWidth' | 'expandFillColumns' | 'headerRow'
  > & { bodyRoot?: HTMLElement | null },
): boolean {
  if (!bodyRow) return false

  const onlyFlexible = options?.onlyWhenColumnHasNoWidth !== false
  const measured = measureColumnWidthsFromBodyRow(bodyRow, visibleColumns, options?.bodyRoot)
  if (!measured) return false

  if (options?.expandFillColumns === false && options.headerRow) {
    const headerCells = Array.from(options.headerRow.children) as HTMLElement[]
    if (headerCells.length === visibleColumns.length) {
      for (let i = 0; i < visibleColumns.length; i++) {
        const col = visibleColumns[i]!
        if (!isElasticFillColumn(col)) continue
        const hw = roundCssPx(headerCells[i]!.getBoundingClientRect().width)
        const key = col.key
        if (isReasonableColumnWidth(hw, options?.bodyRoot)) {
          measured[key] = Math.max(measured[key] ?? 0, hw)
        }
      }
    }
  }

  const collected = collectSyncableWidths(
    measured,
    visibleColumns,
    onlyFlexible,
    options?.expandFillColumns,
  )
  if (!collected) return false
  if (!isMultiColumnLayoutSettled(bodyRow, visibleColumns.length, collected.maxWidth)) {
    return false
  }

  return applyColumnWidthUpdates(collected.pending, columnWidths, visibleColumns)
}

/**
 * 从表体行测量列宽并写入 `columnWidths`，使表头与表体使用同一套像素宽度。
 */
export function syncColumnWidthsFromBodyRow(
  bodyRow: HTMLElement | null | undefined,
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  options?: SyncColumnWidthsFromBodyOptions & { bodyRoot?: HTMLElement | null },
): boolean {
  const bodyRows = options?.bodyRows ?? (bodyRow ? [bodyRow] : [])
  const fitWrote = syncFitContentColumnWidths(
    options?.headerRow,
    bodyRows,
    visibleColumns,
    columnWidths,
    options?.bodyRoot,
  )
  const flexWrote = syncFlexColumnWidthsFromBodyRow(bodyRow, visibleColumns, columnWidths, options)
  return fitWrote || flexWrote
}

/**
 * 从 CwDataTable 表体根节点（`bodyRef`）解析第一条数据行。
 * 兼容非虚拟滚动与虚拟滚动（跳过无子节点的占位 div）。
 */
export function getFirstBodyDataRow(bodyRoot: HTMLElement | null | undefined): HTMLElement | null {
  const rows = getAllBodyDataRows(bodyRoot)
  return rows[0] ?? null
}

/** 表体中全部数据行（跳过虚拟滚动占位节点） */
export function getAllBodyDataRows(bodyRoot: HTMLElement | null | undefined): HTMLElement[] {
  const scroll = getBodyTableScrollRoot(bodyRoot)
  if (!scroll) return []

  const rows: HTMLElement[] = []
  for (let i = 0; i < scroll.children.length; i++) {
    const row = scroll.children[i] as HTMLElement
    if (row.children.length > 0) rows.push(row)
  }
  return rows
}

/**
 * 估算「非 fill 列」占位宽度之和，用于判断是否还有剩余空间可由 fill 吃掉。
 * fill/弹性列只计 minWidth，不计长文本固有宽（否则会误判需要横向滚动）。
 */
export function estimateMinWidthForFillExpand(
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  row?: HTMLElement | null,
  bodyRoot?: HTMLElement | null,
): number {
  const cells =
    row && row.children.length === visibleColumns.length
      ? (Array.from(row.children) as HTMLElement[])
      : []

  let total = 0
  for (let i = 0; i < visibleColumns.length; i++) {
    const col = visibleColumns[i]!
    const cell = cells[i]

    if (isElasticFillColumn(col)) {
      const floor = isExplicitFillColumn(col)
        ? getFillColumnFloorWidth(col)
        : col.minWidth != null && col.minWidth > 0
          ? col.minWidth
          : 0
      if (floor > 0) total += floor
      continue
    }

    const resolved = getColumnResolvedWidth(col, columnWidths)
    if (resolved > 0) {
      total += resolved
      continue
    }

    if (!cell) continue
    total += isFitContentColumn(col)
      ? measureCellFitContentWidth(cell, bodyRoot)
      : cell.getBoundingClientRect().width
  }
  return total
}

/**
 * 仅当存在中间 fill/弹性列，且非 fill 列宽度之和不超过表体可视宽度时，才启用 fill 吃剩余空间。
 *
 * 勿用 row.scrollWidth：行带 min-w-full 时 scrollWidth 会等于容器宽，窄屏下会误判为可吃满。
 */
export function computeShouldExpandFillColumns(
  visibleColumns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  bodyEl: HTMLElement | null | undefined,
): boolean {
  if (!hasElasticFillInMiddleSection(visibleColumns)) return false
  if (!bodyEl) return false

  const containerWidth = bodyEl.clientWidth
  if (containerWidth <= 0) return false

  const row = getFirstBodyDataRow(bodyEl)
  const contentWidth = estimateMinWidthForFillExpand(visibleColumns, columnWidths, row, bodyEl)
  return contentWidth <= containerWidth + WIDTH_EPSILON
}

/** 从表头根节点解析表头行（与 visibleColumns 顺序一致的直接子节点为各表头格） */
export function getHeaderRow(headerRoot: HTMLElement | null | undefined): HTMLElement | null {
  if (!headerRoot) return null
  const scroll = headerRoot.firstElementChild as HTMLElement | null
  if (!scroll) return null
  const row = scroll.firstElementChild as HTMLElement | null
  if (!row || row.children.length === 0) return null
  return row
}
