/**
 * 将金额数值格式化为整数与小数部分（纯函数）
 */
export function formatAmount(
  value: number | string,
  decimals: number
): { integer: string; decimal: string } {
  if (typeof value === 'number') {
    const parts = value.toFixed(decimals).split('.')
    return {
      integer: parts[0],
      decimal: parts[1] ?? ''.padEnd(decimals, '0')
    }
  }
  const num = parseFloat(value)
  if (!Number.isNaN(num)) {
    const parts = num.toFixed(decimals).split('.')
    return {
      integer: parts[0],
      decimal: parts[1] ?? ''.padEnd(decimals, '0')
    }
  }
  return {
    integer: String(value),
    decimal: ''.padEnd(decimals, '0')
  }
}
