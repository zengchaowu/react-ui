import { useMemo } from 'react'
import { applyPaddingToItemPositions, applyPaddingToTotalSize, normalizePadding } from '../functions'

/**
 * Padding 处理 Hook（React 版）
 */
export function usePadding(
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined,
  rawItemPositions: Array<{ top: number; left: number; height: number; width: number }>,
  rawTotalHeight: number,
  rawTotalWidth: number,
) {
  // 规范化 padding 值
  const paddingValues = useMemo(() => normalizePadding(padding), [padding])

  // 应用 padding 到项目位置
  const itemPositions = useMemo(
    () => applyPaddingToItemPositions(rawItemPositions, paddingValues),
    [rawItemPositions, paddingValues],
  )

  // 应用 padding 到总尺寸
  const totalSize = useMemo(
    () => applyPaddingToTotalSize(rawTotalHeight, rawTotalWidth, paddingValues),
    [rawTotalHeight, rawTotalWidth, paddingValues],
  )

  return {
    paddingValues,
    itemPositions,
    totalHeight: totalSize.totalHeight,
    totalWidth: totalSize.totalWidth,
  }
}
