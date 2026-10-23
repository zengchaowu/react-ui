/**
 * 纯函数导出
 */
export { clampScrollTop, clampScrollLeft } from './clampScrollPosition'
export {
  calculateScrollbarVerticalVisible,
  calculateScrollbarHorizontalVisible,
} from './calculateScrollbarVisibility'
export {
  calculateVerticalScrollbarThumbHeight,
  calculateVerticalScrollbarThumbTop,
  calculateHorizontalScrollbarThumbWidth,
  calculateHorizontalScrollbarThumbLeft,
} from './calculateScrollbarThumbSize'
export {
  calculateVerticalScrollbarTrackStyle,
  calculateVerticalScrollbarThumbStyle,
  calculateHorizontalScrollbarTrackStyle,
  calculateHorizontalScrollbarThumbStyle,
} from './calculateScrollbarStyle'
export {
  calculateScrollbarDragScrollTop,
  calculateScrollbarDragScrollLeft,
} from './calculateScrollbarDragPosition'
export {
  calculateVerticalTrackClickScrollTop,
  calculateHorizontalTrackClickScrollLeft,
} from './calculateTrackClickPosition'

export { calculateTotalHeight, calculateTotalWidth } from './calculateTotalSize'
export { normalizePadding } from './normalizePadding'
export { applyPaddingToItemPositions } from './applyPaddingToItemPositions'
export { applyPaddingToTotalSize } from './applyPaddingToTotalSize'
export { calculateContentStyle } from './calculateContentStyle'
export { calculateWheelDelta } from './calculateWheelDelta'

// 共享的虚拟滚动纯函数
export { calculateItemStyle } from './calculateItemStyle'
export { calculateContentTransform } from './calculateContentTransform'
export { calculateVelocity } from './calculateVelocity'
export { updateVelocityHistory } from './updateVelocityHistory'
export { findVisibleRange } from './findVisibleRange'
export { calculateItemPositions } from './calculateItemPositions'
