/** 按刻度数量自动稀疏标签，避免数字重叠 */
export function resolveAutoLabelInterval(optionCount: number): number {
  if (optionCount <= 12) return 1
  if (optionCount <= 24) return 2
  if (optionCount <= 50) return 5
  return 10
}

export function shouldShowCenterRulerTickLabel(
  index: number,
  optionCount: number,
  labelInterval: number,
  isActive: boolean,
  optionValue?: number | string,
): boolean {
  if (optionCount <= 0) return false
  if (isActive) return true
  if (index === 0 || index === optionCount - 1) return true
  if (labelInterval <= 1) return true
  if (typeof optionValue === 'number' && Number.isFinite(optionValue)) {
    return optionValue % labelInterval === 0
  }
  return index % labelInterval === 0
}
