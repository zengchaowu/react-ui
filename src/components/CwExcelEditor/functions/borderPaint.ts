import type { CwExcelBorderEdge, CwExcelCellStyle, CwExcelMerge } from '../types'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { mergeCovering } from './workbook'

const BORDER_WEIGHT: Record<CwExcelBorderEdge['style'], number> = {
  hair: 1,
  dotted: 1,
  dashed: 1,
  thin: 2,
  medium: 3,
  thick: 4,
  double: 5,
}

function strongerBorder(a?: CwExcelBorderEdge, b?: CwExcelBorderEdge) {
  const weightA = a ? BORDER_WEIGHT[a.style] : 0
  const weightB = b ? BORDER_WEIGHT[b.style] : 0
  if (weightA === 0 && weightB === 0) return undefined
  return weightB > weightA ? b : a
}

function darkerBorderColor(a: string, b: string) {
  const luminance = (hex: string) => {
    const value = (hex || tokenSolidColors.black).replace('#', '').slice(-6)
    const red = Number.parseInt(value.slice(0, 2), 16)
    const green = Number.parseInt(value.slice(2, 4), 16)
    const blue = Number.parseInt(value.slice(4, 6), 16)
    if ([red, green, blue].some((channel) => Number.isNaN(channel))) return 0
    return red * 299 + green * 587 + blue * 114
  }
  return luminance(a) <= luminance(b) ? a : b
}

/** 共用边只留更粗的一侧；一样粗时留更深的颜色。 */
function combinedEdge(a?: CwExcelBorderEdge, b?: CwExcelBorderEdge): CwExcelBorderEdge | undefined {
  if (!a) return b
  if (!b) return a
  const heavier = strongerBorder(a, b)
  if (!heavier) return undefined
  if (BORDER_WEIGHT[a.style] !== BORDER_WEIGHT[b.style] || a.color === b.color) return heavier
  return { style: heavier.style, color: darkerBorderColor(a.color, b.color) }
}

function borderEdgeAt(
  styles: (CwExcelCellStyle | null)[][],
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
  side: keyof NonNullable<CwExcelCellStyle['border']>,
) {
  if (row < 0 || col < 0) return undefined
  const direct = styles[row]?.[col]?.border?.[side]
  if (direct) return direct
  const merge = mergeCovering(merges, row, col)
  if (!merge || (merge.row === row && merge.col === col)) return undefined
  return styles[merge.row]?.[merge.col]?.border?.[side]
}

function sharedEastEdge(
  styles: (CwExcelCellStyle | null)[][],
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
) {
  return combinedEdge(
    borderEdgeAt(styles, merges, row, col, 'right'),
    borderEdgeAt(styles, merges, row, col + 1, 'left'),
  )
}

function sharedSouthEdge(
  styles: (CwExcelCellStyle | null)[][],
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
) {
  return combinedEdge(
    borderEdgeAt(styles, merges, row, col, 'bottom'),
    borderEdgeAt(styles, merges, row + 1, col, 'top'),
  )
}

function shadowFor(side: 'left' | 'right' | 'top' | 'bottom', edge: CwExcelBorderEdge) {
  const color = edge.color || tokenSolidColors.black
  const px = edge.style === 'thick' || edge.style === 'double' ? 3 : edge.style === 'medium' ? 2 : 1
  if (edge.style === 'double') {
    if (side === 'bottom') return [`inset 0 -1px 0 ${color}`, `inset 0 -3px 0 ${color}`]
    if (side === 'top') return [`inset 0 1px 0 ${color}`, `inset 0 3px 0 ${color}`]
    if (side === 'right') return [`inset -1px 0 0 ${color}`, `inset -3px 0 0 ${color}`]
    return [`inset 1px 0 0 ${color}`, `inset 3px 0 0 ${color}`]
  }
  if (side === 'bottom') return [`inset 0 -${px}px 0 ${color}`]
  if (side === 'top') return [`inset 0 ${px}px 0 ${color}`]
  if (side === 'right') return [`inset -${px}px 0 0 ${color}`]
  return [`inset ${px}px 0 0 ${color}`]
}

function borderBoxShadow(sides: {
  left?: CwExcelBorderEdge
  right?: CwExcelBorderEdge
  top?: CwExcelBorderEdge
  bottom?: CwExcelBorderEdge
}) {
  const parts: string[] = []
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const edge = sides[side]
    if (edge) parts.push(...shadowFor(side, edge))
  }
  return parts.join(', ')
}

function borderWidthPx(edge?: CwExcelBorderEdge) {
  if (!edge) return 0
  if (edge.style === 'thick' || edge.style === 'double') return 3
  if (edge.style === 'medium') return 2
  return 1
}

/** 邻格是否已负责共用边（普通格画东/南，或另一块合并画东/南）。 */
function neighborOwnsEdge(
  merges: readonly CwExcelMerge[],
  merge: CwExcelMerge,
  side: 'west' | 'north',
  index: number,
) {
  if (side === 'west') {
    const col = merge.col - 1
    if (col < 0) return false
    const hit = mergeCovering(merges, index, col)
    if (!hit) return true
    return hit !== merge
  }
  const row = merge.row - 1
  if (row < 0) return false
  const hit = mergeCovering(merges, row, index)
  if (!hit) return true
  return hit !== merge
}

/** 普通格东、南边；与合并块相邻时仍在本格画共用边。 */
export function visibleCellBorders(
  styles: (CwExcelCellStyle | null)[][],
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
) {
  const right = sharedEastEdge(styles, merges, row, col)
  const bottom = sharedSouthEdge(styles, merges, row, col)
  const left = col === 0 ? borderEdgeAt(styles, merges, row, col, 'left') : undefined
  const top = row === 0 ? borderEdgeAt(styles, merges, row, col, 'top') : undefined
  return {
    shadow: borderBoxShadow({ left, right, top, bottom }),
    right: !!right,
    bottom: !!bottom,
  }
}

/** 合并块内画西、北内阴影 + 东（border-right）、南外廓；共用边不重复。 */
export function visibleMergeBorders(
  styles: (CwExcelCellStyle | null)[][],
  merges: readonly CwExcelMerge[],
  merge: CwExcelMerge,
) {
  const rightCol = merge.col + merge.colspan - 1
  const bottomRow = merge.row + merge.rowspan - 1
  let right: CwExcelBorderEdge | undefined
  let bottom: CwExcelBorderEdge | undefined
  let left: CwExcelBorderEdge | undefined
  let top: CwExcelBorderEdge | undefined
  for (let row = merge.row; row < merge.row + merge.rowspan; row += 1) {
    if (!neighborOwnsEdge(merges, merge, 'west', row)) {
      left = strongerBorder(left, combinedEdge(
        borderEdgeAt(styles, merges, row, merge.col, 'left'),
        borderEdgeAt(styles, merges, row, merge.col - 1, 'right'),
      ))
    }
    right = strongerBorder(right, sharedEastEdge(styles, merges, row, rightCol))
  }
  for (let col = merge.col; col < merge.col + merge.colspan; col += 1) {
    if (!neighborOwnsEdge(merges, merge, 'north', col)) {
      top = strongerBorder(top, combinedEdge(
        borderEdgeAt(styles, merges, merge.row, col, 'top'),
        borderEdgeAt(styles, merges, merge.row - 1, col, 'bottom'),
      ))
    }
    bottom = strongerBorder(bottom, sharedSouthEdge(styles, merges, bottomRow, col))
  }
  return {
    shadow: borderBoxShadow({ left, top, bottom }),
    right: !!right,
    bottom: !!bottom,
    rightColor: right?.color || '',
    rightWidth: borderWidthPx(right),
  }
}
