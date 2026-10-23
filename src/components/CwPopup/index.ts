// React 组件导出
export { CwPopup } from './CwPopup'

// 主函数式 API（React Hook 版）
export { createCwPopup } from './functions/createCwPopup'

// 与 README 移动端 hover 规范一致的媒体查询工具（Tooltip / hover 触发浮层）
export {
  FINE_POINTER_HOVER_MEDIA,
  finePointerHoverMatches,
  isHoverFinePointerMode,
  isHoverCoarseTouchMode,
  resolveHoverCloseOnClickOutside,
} from './utils/finePointerHoverMedia'

// 插件导出
export { createDimensions } from './plugins/dimensions'
export { createPosition } from './plugins/position'
export { createOffset } from './plugins/offset'
export { createFlip } from './plugins/flip'
export { createPreventOverflow } from './plugins/prevent-overflow'
export { createArrow } from './plugins/arrow'
export { createAdaptiveHeight } from './plugins/adaptive-height'

export * from './types'
export {
  CW_POPUP_MENTION_PANEL_SHELL_CLASS,
  CW_POPUP_EMOJI_PICKER_SHELL_CLASS,
  CW_POPUP_EMOJI_PICKER_TRIGGER_CLASS,
  cwPopupAppearancePopupClass,
  cwPopupAppearanceTriggerClass,
  resolveCwPopupShellClass,
  resolveCwPopupTriggerClass,
} from './styles'
