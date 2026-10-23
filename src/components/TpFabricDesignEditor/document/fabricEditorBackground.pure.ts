import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

/** Fabric 6 透明底须为 `''`；字符串 `transparent` 仍会参与清屏上色并盖住 CSS 棋盘格 */
export function isFabricTransparentBackground(
  color: string | null | undefined,
): boolean {
  if (color == null) return false
  const normalized = color.trim().toLowerCase()
  return normalized === '' || normalized === 'transparent' || normalized === 'none'
}

export function resolveFabricCanvasBackgroundColor(
  color: string | null | undefined,
  fallback: string = tokenSolidColors.white,
): string {
  if (isFabricTransparentBackground(color)) return ''
  return color ?? fallback
}
