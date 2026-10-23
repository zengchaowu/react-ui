/**
 * 计算中间副本位置信息
 */
export function calculateMiddleCopyInfo(
  copyCount: number,
  singleCopyHeight: number,
  singleCopyWidth: number
): { index: number; top: number; left: number; topEnd: number; leftEnd: number } | null {
  if (copyCount === 0) return null

  const middleCopyIndex = Math.floor(copyCount / 2)

  return {
    index: middleCopyIndex,
    top: singleCopyHeight * middleCopyIndex,
    left: singleCopyWidth * middleCopyIndex,
    topEnd: singleCopyHeight * (middleCopyIndex + 1),
    leftEnd: singleCopyWidth * (middleCopyIndex + 1)
  }
}

