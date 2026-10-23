import { useMemo } from 'react'
import {
  normalizePadding,
  applyPaddingToItemPositions,
  applyPaddingToTotalSize,
} from '../functions'
import type { ItemPosition } from './useVisibleRange'

/**
 * Padding 处理 Hook
 */
export function usePadding(
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined,
  rawItemPositions: ItemPosition[],
  rawTotalHeight: number,
  rawTotalWidth: number,
) {
  const paddingValues = useMemo(() => normalizePadding(padding), [padding])

  const itemPositions = useMemo(
    () => applyPaddingToItemPositions(rawItemPositions, paddingValues),
    [rawItemPositions, paddingValues],
  )

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
