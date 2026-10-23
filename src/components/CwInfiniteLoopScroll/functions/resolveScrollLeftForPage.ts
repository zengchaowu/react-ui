import { pickShortestLoopScrollTarget } from './pickShortestLoopScrollTarget'

type MiddleCopyInfo = {
  left: number
  leftEnd?: number
} | null

/**
 * 逻辑页 → 中间副本上的绝对 scrollLeft（取最短环路径，避免连滑偏页）。
 */
export function resolveScrollLeftForPage(
  page: number,
  scrollLeft: number,
  pageWidth: number,
  middleCopyInfo: MiddleCopyInfo,
): number {
  if (!middleCopyInfo || pageWidth <= 0) return scrollLeft
  const ideal = middleCopyInfo.left + page * pageWidth
  const copyW =
    typeof middleCopyInfo.leftEnd === 'number'
      ? Math.max(0, middleCopyInfo.leftEnd - middleCopyInfo.left)
      : 0
  return pickShortestLoopScrollTarget(scrollLeft, ideal, copyW)
}
