/**
 * 计算目标页位置（用于滚轮）
 */
export function calculatePageTarget(
  current: number,
  middle: number,
  pageSize: number,
  delta: number
): number {
  if (pageSize <= 0) return current
  const relative = current - middle
  const currentPage = Math.floor(relative / pageSize)
  const newPage = delta > 0 ? currentPage + 1 : currentPage - 1
  return middle + newPage * pageSize
}

