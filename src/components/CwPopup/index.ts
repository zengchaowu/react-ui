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
} from '@zengchaowu/ui-shared/components/CwPopup/utils/finePointerHoverMedia'

// 插件导出
export { createDimensions } from '@zengchaowu/ui-shared/components/CwPopup/plugins/dimensions'
export { createPosition } from '@zengchaowu/ui-shared/components/CwPopup/plugins/position'
export { createOffset } from '@zengchaowu/ui-shared/components/CwPopup/plugins/offset'
export { createFlip } from '@zengchaowu/ui-shared/components/CwPopup/plugins/flip'
export { createPreventOverflow } from '@zengchaowu/ui-shared/components/CwPopup/plugins/prevent-overflow'
export { createArrow } from '@zengchaowu/ui-shared/components/CwPopup/plugins/arrow'
export { createAdaptiveHeight } from '@zengchaowu/ui-shared/components/CwPopup/plugins/adaptive-height'

export * from './types'
export type * from '@zengchaowu/ui-shared/components/CwPopup/types'
export {
  CW_POPUP_MENTION_PANEL_SHELL_CLASS,
  CW_POPUP_EMOJI_PICKER_SHELL_CLASS,
  CW_POPUP_EMOJI_PICKER_TRIGGER_CLASS,
  cwPopupAppearancePopupClass,
  cwPopupAppearanceTriggerClass,
  resolveCwPopupShellClass,
  resolveCwPopupTriggerClass,
} from './styles'
