/**
 * 纯函数导出
 * 纯计算统一收敛到 @zengchaowu/ui-shared，本文件仅做路径转发。
 */
export { clampScrollTop, clampScrollLeft } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/clampScrollPosition'
export {
  calculateScrollbarVerticalVisible,
  calculateScrollbarHorizontalVisible,
} from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateScrollbarVisibility'
export {
  calculateVerticalScrollbarThumbHeight,
  calculateVerticalScrollbarThumbTop,
  calculateHorizontalScrollbarThumbWidth,
  calculateHorizontalScrollbarThumbLeft,
} from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateScrollbarThumbSize'
export {
  calculateVerticalScrollbarTrackStyle,
  calculateVerticalScrollbarThumbStyle,
  calculateHorizontalScrollbarTrackStyle,
  calculateHorizontalScrollbarThumbStyle,
} from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateScrollbarStyle'
export {
  calculateScrollbarDragScrollTop,
  calculateScrollbarDragScrollLeft,
} from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateScrollbarDragPosition'
export {
  calculateVerticalTrackClickScrollTop,
  calculateHorizontalTrackClickScrollLeft,
} from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateTrackClickPosition'

export { calculateTotalHeight, calculateTotalWidth } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateTotalSize'
export { normalizePadding } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/normalizePadding'
export { applyPaddingToItemPositions } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/applyPaddingToItemPositions'
export { applyPaddingToTotalSize } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/applyPaddingToTotalSize'
export { calculateContentStyle } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateContentStyle'
export { calculateWheelDelta } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateWheelDelta'

// 共享的虚拟滚动纯函数
export { calculateItemStyle } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateItemStyle'
export { calculateContentTransform } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateContentTransform'
export { calculateVelocity } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateVelocity'
export { updateVelocityHistory } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/updateVelocityHistory'
export { findVisibleRange } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/findVisibleRange'
export { calculateItemPositions } from '@zengchaowu/ui-shared/components/CwVirtualScroll/functions/calculateItemPositions'
