import type { CwCenterRulerPickerValue } from '../types'

export function findOptionIndex(
  value: CwCenterRulerPickerValue,
  options: readonly CwCenterRulerPickerValue[],
): number {
  const index = options.indexOf(value)
  return index >= 0 ? index : 0
}

export function resolveOptionValue<T extends CwCenterRulerPickerValue>(
  index: number,
  options: readonly T[],
): T | undefined {
  if (options.length === 0) return undefined
  const clamped = Math.min(options.length - 1, Math.max(0, index))
  return options[clamped]
}
