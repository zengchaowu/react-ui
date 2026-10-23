export type GridColFlushOptions = {
  flushStart?: boolean
  flushEnd?: boolean
}

export function isFirstColInRow(index: number, columns: number): boolean {
  return index % columns === 0
}

/** 行内真正的末列。末行未满时，最后一项留在自己的列，不把它当成贴右列。 */
export function isLastColInRow(index: number, columns: number): boolean {
  if (columns <= 0) return false
  return index % columns === columns - 1
}

/**
 * 列内子项水平对齐（配合子组件非满宽时使用，类似 CwTabsStrip 贴边视觉）
 */
export function resolveGridColContentAlign(
  index: number,
  _total: number,
  columns: number,
  options: GridColFlushOptions,
): 'start' | 'end' | 'center' | undefined {
  if (!options.flushStart && !options.flushEnd) return undefined
  if (options.flushStart && isFirstColInRow(index, columns)) return 'start'
  if (options.flushEnd && isLastColInRow(index, columns)) return 'end'
  return 'center'
}

/**
 * 传统 gutter（Col 左右 padding）模式下去掉行首/行末的外侧 padding
 */
export function resolveGridColFlushPaddingStyle(
  index: number,
  _total: number,
  columns: number,
  gutter: number,
  usesMeasuredLayout: boolean,
  options: GridColFlushOptions,
): Record<string, string> | undefined {
  if (usesMeasuredLayout || gutter <= 0 || (!options.flushStart && !options.flushEnd)) {
    return undefined
  }
  const style: Record<string, string> = {}
  if (options.flushStart && isFirstColInRow(index, columns)) {
    style.paddingLeft = '0'
  }
  if (options.flushEnd && isLastColInRow(index, columns)) {
    style.paddingRight = '0'
  }
  return Object.keys(style).length > 0 ? style : undefined
}
