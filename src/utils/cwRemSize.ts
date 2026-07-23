/** 设计稿 px（16px 根字号基准）→ CSS rem */
export function designPxToRem(px: number): string {
  const rem = Math.round((px / 16) * 10000) / 10000
  return `${rem}rem`
}

/** 设计稿 px → rem 数值（供 CwIcon/CwAvatar/CwFileIcon 的 `size` 使用） */
export function designPxToRemNum(px: number): number {
  return Math.round((px / 16) * 10000) / 10000
}

/** 常用 CwFileIcon 边长（rem） */
export const CW_FILE_ICON_SIZE_TREE_ROW = designPxToRemNum(14)
export const CW_FILE_ICON_SIZE_COMPOSER_PENDING = designPxToRemNum(16)

/** prop 高度/宽度：number 视为设计稿 px → rem；string 原样（应为 rem 或 %） */
export function resolveDesignCssSize(value: string | number): string {
  if (typeof value === 'number') return designPxToRem(value)
  return value
}

/** 图标/头像边长：`size` 为 rem；`size: 0` 表示尺寸由 em/CSS 承担 */
export interface CwRemBoxSize {
  /** 边长（rem）；`0` 不注入 inline 宽高 */
  size?: number
}

function resolveBoxSizeRem(
  styles: CwRemBoxSize,
  fallbackRem?: number,
): number | undefined {
  if (styles.size === 0) return undefined
  if (styles.size != null) return styles.size
  return fallbackRem
}

export function resolveCwBoxSizeStyle(
  styles: CwRemBoxSize,
  fallbackRem?: number,
): Record<string, string> {
  const rem = resolveBoxSizeRem(styles, fallbackRem)
  if (rem == null) return {}
  return {
    width: `${rem}rem`,
    height: `${rem}rem`,
  }
}

export function resolveCwIconFontSizeStyle(
  styles: CwRemBoxSize,
  fallbackRem?: number,
): Record<string, string> {
  const rem = resolveBoxSizeRem(styles, fallbackRem)
  if (rem == null) return {}
  return { fontSize: `${rem}rem` }
}
