import type { CwRichTextStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwRichTextStyles = {
  // 根容器：基础样式（布局）
  root: 'cw-rich-text inline-block',
  // 根容器：状态（互斥）
  rootNormal: '',
  rootDisabled: '',
  rootReadonly: '',

  // 普通文本：使用 tokens 管理颜色
  text: 'text-[var(--text-color-primary)]',

  // 链接：基础样式（移除默认 focus ring，改为配合 useFocusVisible 控制）
  link: 'outline-none focus:outline-none',
  // 链接：状态（互斥）
  linkNormal: 'text-[var(--text-color-link)] cursor-pointer',
  linkDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  linkReadonly: 'text-[var(--text-color-link)] cursor-default',
  // 链接：聚焦样式（仅键盘导航时显示）
  linkFocused: INTERACTIVE_FOCUS_CLASS,

  // 粗体文本
  bold: 'font-semibold',

  // 斜体文本
  italic: 'italic',

  // 下划线文本
  underline: 'underline',
  // 尺寸样式：小
  sizeSmall: 'text-xs',
  // 尺寸样式：中
  sizeMedium: 'text-sm',
  // 尺寸样式：大
  sizeLarge: 'text-base'
}


