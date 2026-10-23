/**
 * 从循环项目中计算可见范围（返回原始索引）
 */
export function calculateVisibleRangeFromLoopItems(
  visibleRange: { startIndex: number; endIndex: number },
  loopItems: Array<{ originalIndex: number }>
): { startIndex: number; endIndex: number } {
  const { startIndex, endIndex } = visibleRange

  if (startIndex < 0 || endIndex < 0) {
    return { startIndex: 0, endIndex: -1 }
  }

  // 转换为原始索引
  const startOriginalIndex = loopItems[startIndex]?.originalIndex ?? 0
  const endOriginalIndex = loopItems[endIndex]?.originalIndex ?? 0

  return { startIndex: startOriginalIndex, endIndex: endOriginalIndex }
}

