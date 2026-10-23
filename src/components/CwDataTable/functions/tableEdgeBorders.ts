import { getAllBodyDataRows, getBodyTableScrollRoot } from './syncColumnWidthsFromBody'

/** 亚像素 / 发丝线叠线容差 */
export const TABLE_EDGE_GAP_EPSILON_PX = 2

const BOTTOM_BORDER_UTIL_RE = /^!?border-b(?:-|$)/
const RIGHT_BORDER_UTIL_RE = /^!?border-r(?:-|$)/

function stripMatchingClasses(className: string, re: RegExp): string {
  return className
    .split(/\s+/)
    .filter((c) => c && !re.test(c))
    .join(' ')
}

/** 去掉 border-b*，避免与 border-b-0 在 Tailwind 源码序中互相覆盖 */
export function stripRowBottomBorderClasses(className: string): string {
  return stripMatchingClasses(className, BOTTOM_BORDER_UTIL_RE)
}

/** 去掉 border-r*，避免与 border-r-0 在 Tailwind 源码序中互相覆盖 */
export function stripCellRightBorderClasses(className: string): string {
  return stripMatchingClasses(className, RIGHT_BORDER_UTIL_RE)
}

export type TableEdgeBorderOmits = {
  omitLastRowBottomBorder: boolean
  omitLastColumnRightBorder: boolean
}

/**
 * 一次 DOM 测量，决定末行底边 / 最右列右边是否去掉。
 * - 有可见空隙 → 保留分割线
 * - 贴边（或滚到贴边）→ 去掉，避免与表格外框叠成双线
 *
 * 纵向不能用 scrollHeight：CwDiv 内容层有 min-h-full，行未填满时仍会被撑满。
 * 横向右缘用 clientWidth，排除纵向滚动条占位。
 */
export function resolveTableEdgeBorderOmits(
  viewport: HTMLElement | null,
): TableEdgeBorderOmits {
  if (!viewport) {
    return { omitLastRowBottomBorder: true, omitLastColumnRightBorder: true }
  }

  const rows = getAllBodyDataRows(viewport)
  const viewportRect = viewport.getBoundingClientRect()

  const bottomGap =
    rows.length === 0
      ? viewport.clientHeight
      : viewportRect.bottom - rows[rows.length - 1]!.getBoundingClientRect().bottom

  const contentRight = viewportRect.left + viewport.clientLeft + viewport.clientWidth
  let rightGap: number
  if (rows.length > 0) {
    const lastCell = rows[0]!.lastElementChild as HTMLElement | null
    rightGap = lastCell
      ? contentRight - lastCell.getBoundingClientRect().right
      : viewport.clientWidth
  } else {
    const scroll = getBodyTableScrollRoot(viewport)
    rightGap = scroll
      ? contentRight - scroll.getBoundingClientRect().right
      : viewport.clientWidth
  }

  return {
    omitLastRowBottomBorder: bottomGap <= TABLE_EDGE_GAP_EPSILON_PX,
    omitLastColumnRightBorder: rightGap <= TABLE_EDGE_GAP_EPSILON_PX,
  }
}
