/**
 * 计算页对齐位置
 */
export function calculatePageSnap(
  current: number,
  middle: number,
  pageSize: number,
  threshold: number
): number {
  if (pageSize <= 0) return current
  const relative = current - middle
  
  // 计算相对于 middle 的页数（可能是小数）
  const pageNumber = relative / pageSize
  
  // 向下取整得到当前页索引
  const currentPageIndex = Math.floor(pageNumber)
  
  // 计算在当前页内的偏移量（归一化到 [0, pageSize) 范围）
  // 这样无论 relative 是正数还是负数，offset 都在 [0, pageSize) 范围内
  let offsetInPage = relative - currentPageIndex * pageSize
  if (offsetInPage < 0) {
    offsetInPage += pageSize
  }
  
  // 根据阈值决定是停留在当前页还是跳到下一页
  // 如果偏移超过阈值比例，则跳到下一页
  const targetPageIndex = offsetInPage > pageSize * threshold ? currentPageIndex + 1 : currentPageIndex
  
  return middle + targetPageIndex * pageSize
}

