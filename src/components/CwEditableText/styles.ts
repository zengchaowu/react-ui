import type { CwEditableTextStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwEditableTextStyles = {
  // 根容器：基础 + 状态
  root: 'cw-editable-text inline-flex items-center',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 预览容器：基础 + 状态 + 聚焦（group 供编辑图标 hover 显隐；relative 供 hover 模式绝对定位图标）
  previewContainer: 'group/cw-editable-text relative flex items-center gap-2 outline-none focus:outline-none',
  previewContainerNormal: 'cursor-pointer',
  previewContainerDisabled: 'cursor-not-allowed',
  previewContainerReadonly: 'cursor-default',
  previewContainerFocused: INTERACTIVE_FOCUS_CLASS,

  // 预览文本：基础 + 状态
  previewText: 'text-sm',
  previewTextNormal: 'text-[var(--text-color-primary)]',
  previewTextDisabled: 'text-[var(--text-color-disabled)]',
  previewTextReadonly: 'text-[var(--text-color-primary)]',
  previewTextEmpty: 'text-[var(--text-color-placeholder)]',
  previewTextAlign: '', // 由 computed 根据 align 属性动态设置

  // 编辑图标容器：基础 + 状态
  editIconContainer: 'flex shrink-0 items-center justify-center outline-none transition-opacity',
  editIconContainerNormal: 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer',
  editIconContainerDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  editIconContainerReadonly: 'text-[var(--text-color-secondary)] cursor-default',
  // hover 模式：绝对定位到文本右侧，不占布局，避免未悬停时文本被挤偏
  editIconContainerHoverReveal:
    'absolute left-full top-1/2 ml-2 -translate-y-1/2 opacity-0 pointer-events-none group-hover/cw-editable-text:pointer-events-auto group-hover/cw-editable-text:opacity-100 group-focus-within/cw-editable-text:pointer-events-auto group-focus-within/cw-editable-text:opacity-100',

  // 编辑容器：包裹输入框和 loading
  editContainer: 'flex items-center gap-2',
  
  // Loading：基础样式
  loadingContainer: 'flex items-center justify-center flex-shrink-0',
  
  // 子组件样式配置（必须作为独立子对象）
  iconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1
  },
  
  loadingStyles: {}
}
