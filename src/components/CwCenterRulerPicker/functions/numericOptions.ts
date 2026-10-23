export function buildNumericPickerOptions(
  min: number,
  max: number,
  step = 1,
): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0) {
    return []
  }
  const start = Math.min(min, max)
  const end = Math.max(min, max)
  const options: number[] = []
  for (let value = start; value <= end; value += step) {
    options.push(Math.round(value * 1000) / 1000)
  }
  return options
}
