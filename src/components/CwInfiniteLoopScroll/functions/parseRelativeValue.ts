/**
 * 解析相对值（如 '1/3' 表示 1/3）
 */
export function parseRelativeValue(
  value: string | number | undefined,
  containerSize: number
): number {
  if (value === undefined) {
    return containerSize
  }

  if (typeof value === 'number') {
    return value
  }

  // 解析相对值，如 '1/3', '2/5' 等
  const match = value.match(/^(\d+)\/(\d+)$/)
  if (match) {
    const numerator = parseFloat(match[1])
    const denominator = parseFloat(match[2])
    if (denominator > 0) {
      return (containerSize * numerator) / denominator
    }
  }

  // 如果不是相对值格式，尝试直接解析为数字
  const numValue = parseFloat(value)
  if (!isNaN(numValue)) {
    return numValue
  }

  // 默认返回容器尺寸
  return containerSize
}

