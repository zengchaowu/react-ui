import type { CwSelectTagsStyles } from './types'
import { FORM_CONTROL_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwSelectTagsStyles = {
  // 根容器：基础 + 状态
  root: 'cw-select-tags w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 标签：基础 + 状态
  label: 'text-sm whitespace-nowrap flex-shrink-0 mb-2 font-normal',
  labelNormal: 'text-[var(--text-color-secondary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',

  // 标签容器：基础 + 状态 + 聚焦
  tagsWrapper: 'flex items-center rounded-md overflow-hidden outline-none border',
  tagsWrapperNormal: 'border-[var(--component-border)] cursor-text bg-[var(--bg-color-container)]',
  tagsWrapperReadonly: 'border-[var(--component-border)] cursor-default bg-[var(--bg-color-container)]',
  tagsWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
  tagsWrapperDisabled: 'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',

  // 标签列表容器（水平内边距与 CwInput 的 px-2 对齐，不再叠加外层 py）
  tagsContainer: 'flex flex-wrap items-center gap-1 flex-1 min-w-0 px-2',
  suffix:
    'flex items-center justify-end gap-1 self-stretch flex-shrink-0 overflow-visible',
  
  // 单个标签项
  tagItem: '',
  
  // 更多标签
  moreTag: 'inline-flex items-center gap-1 cursor-pointer',
  
  // 占位符
  placeholder: 'flex items-center text-[var(--text-color-placeholder)]',
  placeholderNormal: '',
  placeholderDisabled: 'text-[var(--text-color-disabled)]',

  // 更多图标样式
  moreIconStyles: {
    root: 'inline-flex items-center justify-center text-current',
    size: 0.875
  },
  // 尺寸样式：小/中/大（与 CwInput 的 h-7 / h-9 / h-11 一致）
  sizeSmall: 'min-h-7',
  sizeMedium: 'min-h-9',
  sizeLarge: 'min-h-11',
  // 占位符尺寸样式：小
  placeholderSizeSmall: 'text-xs',
  // 占位符尺寸样式：中
  placeholderSizeMedium: 'text-sm',
  // 占位符尺寸样式：大
  placeholderSizeLarge: 'text-base'
}

