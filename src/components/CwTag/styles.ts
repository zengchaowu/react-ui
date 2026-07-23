import type { CwTagStyles } from './types'
import type {  CwIconEmbed  } from '../CwIcon/types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwTagStyles = {
  // 根容器：基础样式
  root: 'cw-tag inline-flex items-center gap-1 rounded-[var(--radius-default)] outline-none focus:outline-none transition-colors duration-200 select-none',
  // 根容器：正常状态
  rootNormal: 'cursor-pointer',
  // 根容器：禁用状态
  rootDisabled: 'cursor-not-allowed',
  // 根容器：只读状态
  rootReadonly: 'cursor-default',
  // 根容器：聚焦样式
  rootFocused: INTERACTIVE_FOCUS_CLASS,
  // 标签内容：基础样式（字号由 contentSize* 与 size 对齐）
  content: 'font-normal min-w-0 truncate',
  contentSizeSmall: 'text-xs',
  contentSizeMedium: 'text-sm',
  contentSizeLarge: 'text-base',
  // 标签内容：正常状态
  contentNormal: 'text-[var(--text-color-primary)]',
  // 标签内容：禁用状态
  contentDisabled: 'text-[var(--text-color-disabled)]',
  // 标签内容：只读状态
  contentReadonly: 'text-[var(--text-color-primary)]',
  // 删除按钮：基础样式
  closeButton: 'inline-flex items-center justify-center transition-colors duration-200',
  // 删除按钮：正常状态
  closeButtonNormal: 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer',
  // 删除按钮：禁用状态
  closeButtonDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  // 删除按钮：只读状态
  closeButtonReadonly: 'text-[var(--text-color-secondary)] cursor-default',
  // 删除按钮：悬停状态
  closeButtonHover: '',
  // 类型样式：默认
  typeDefault: 'bg-[var(--bg-color-component)] border border-[var(--component-border)]',
  // 类型样式：主要
  typePrimary: 'bg-[var(--button-brand-tint-active-bg)] border border-[var(--brand-color-special)] text-[var(--brand-color-6)]',
  // 类型样式：成功
  typeSuccess: 'bg-[var(--success-color-light)] border border-[var(--success-color-special)] text-[var(--success-color-6)]',
  // 类型样式：警告
  typeWarning: 'bg-[var(--warning-color-light)] border border-[var(--warning-color-special)] text-[var(--warning-color-6)]',
  // 类型样式：危险
  typeDanger: 'bg-[var(--button-danger-tint-active-bg)] border border-[var(--error-color-special)] text-[var(--error-color-6)]',
  // 尺寸样式：小（用于 SelectTags 等紧凑场景）
  sizeSmall: 'px-1.5 py-0.5 text-xs',
  // 尺寸样式：中
  sizeMedium: 'px-2 py-0.5 text-sm',
  // 尺寸样式：大
  sizeLarge: 'px-3 py-1.5 text-base',
  // CwIcon 样式配置（删除图标）
  closeIconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 0.875
  } as CwIconEmbed
}

