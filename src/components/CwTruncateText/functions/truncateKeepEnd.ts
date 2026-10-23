/**
 * 按字符数截断并保留末尾（非像素级；DOM 展示请用 `CwTruncateText`）。
 */
export function truncateKeepEnd(
  text: string,
  maxLength: number,
  ellipsis = '…',
): string {
  const s = text ?? ''
  const max = Math.max(ellipsis.length, maxLength)
  if (s.length <= max) return s
  const keep = max - ellipsis.length
  if (keep <= 0) return ellipsis.slice(0, max)
  return `${ellipsis}${s.slice(-keep)}`
}
