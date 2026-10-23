/**
 * 推导数值的小数位数（用于步进时消除浮点误差）
 */
export function decimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return 0
  const str = String(value)
  if (/e/i.test(str)) {
    const [coeff, expStr] = str.toLowerCase().split('e')
    const exp = Number(expStr)
    const frac = coeff.includes('.') ? coeff.split('.')[1]!.length : 0
    return Math.max(0, frac - exp)
  }
  const i = str.indexOf('.')
  return i < 0 ? 0 : str.length - i - 1
}

/**
 * 按当前值与 step 的最大小数位做步进，避免 0.7 + 0.1 → 0.799999…
 */
export function stepNumber(
  current: number,
  step: number,
  direction: 1 | -1,
): number {
  const places = Math.max(decimalPlaces(current), decimalPlaces(step))
  const next = current + direction * step
  return Number(next.toFixed(places))
}
