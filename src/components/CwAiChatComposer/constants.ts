import { splitComposerPlainText } from './composerPlainText'

/** 与 tokens.css --line-height-composer 保持一致 */
export const COMPOSER_LINE_HEIGHT_REM = 1.5
/** narrow 未聚焦 placeholder 光学上移（相对 16px 约 1px） */
export const COMPOSER_INLINE_TEXT_OPTICAL_NUDGE_REM = 0.0625
/** 发送槽收起/展开动画（cw-ai-chat-composer-actions.css） */
export const COMPOSER_ACTION_CLOSE_DURATION = '0.28s'
export const COMPOSER_ACTION_CLOSE_EASE = 'cubic-bezier(0.4, 0, 0.8, 0.45)'
export const COMPOSER_ACTION_OPEN_DURATION = '0.48s'
export const COMPOSER_ACTION_OPEN_EASE = 'cubic-bezier(0.34, 1.45, 0.64, 1)'
/** 窄屏 layout 下编辑区最多行数 */
export const NARROW_LAYOUT_MAX_ROWS = 2
/** 桌面 wide 默认最小行数（底栏工具条另占一行） */
export const WIDE_LAYOUT_MIN_ROWS = 1
export const COMPOSER_SHELL_PAD_Y_REM = 0.625
/** 移动端底栏内边距（与 layoutGeometry shellPad 一致） */
export const COMPOSER_MOBILE_SHELL_PAD_Y_REM = 0.375
export const COMPOSER_MOBILE_SHELL_PAD_X_REM = 0.375
export const COMPOSER_TOOLBAR_GAP_REM = 0.375
export const COMPOSER_TOOLBAR_HEIGHT_REM = 1.75
/** 移动端底栏按钮与「按住说话」触控高度（略高于桌面 1.75rem） */
export const COMPOSER_MOBILE_BTN_REM = 2.125
/** 移动端有草稿时「发送」文字按钮宽度（宽于图标按钮，与 layoutGeometry 一致） */
export const COMPOSER_MOBILE_SEND_BTN_REM = 3

export function countComposerVisualRows(text: string): number {
  if (text.length === 0) return 1
  const lines = splitComposerPlainText(text)
  return Math.max(1, lines.length)
}
