/**
 * 纯函数导出
 */
export { parseRelativeValue } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/parseRelativeValue'
export { calculatePageSnap } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculatePageSnap'
export { calculateDragReleasePageSnap } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateDragReleasePageSnap'
export { resolveTargetPageFromDragOffset } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/resolveTargetPageFromDragOffset'
export { calculatePageTarget } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculatePageTarget'
export { easeOutCubic } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/easeOutCubic'
export { calculateSingleCopyHeight, calculateSingleCopyWidth } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateSingleCopySize'
export { calculateCopyCount } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateCopyCount'
export { createLoopItems } from './createLoopItems'
export { calculateMiddleCopyInfo } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateMiddleCopyInfo'
export { calculateTotalHeight, calculateTotalWidth } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateTotalSize'
export { checkAndJumpToMiddle } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/checkAndJumpToMiddle'
export { calculateScrollTargetForIndex } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateScrollTargetForIndex'
export { calculateRelativeScrollPosition } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateRelativeScrollPosition'
export { calculateVisibleRangeFromLoopItems } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateVisibleRangeFromLoopItems'
export { calculateWheelDelta } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateWheelDelta'
export { calculateCenterIndex } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/calculateCenterIndex'
export {
  normalizeLoopPage,
  stepLoopPageByDragDistance,
  stepLoopPageByDelta,
} from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/stepLoopPage'
export { pickShortestLoopScrollTarget } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/pickShortestLoopScrollTarget'
export { resolveScrollLeftForPage } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/resolveScrollLeftForPage'
export { normalizePadding } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/normalizePadding'
export { applyPaddingToItemPositions } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/applyPaddingToItemPositions'
export { applyPaddingToTotalSize } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/applyPaddingToTotalSize'

export { calculateVelocity } from './calculateVelocity'
export { updateVelocityHistory } from './updateVelocityHistory'
export { calculateItemPositions } from './calculateItemPositions'
export { findVisibleRange } from './findVisibleRange'
export { calculateContentTransform } from './calculateContentTransform'
export { calculateItemStyle } from './calculateItemStyle'
export type { VirtualWindow } from './virtualWindow'
