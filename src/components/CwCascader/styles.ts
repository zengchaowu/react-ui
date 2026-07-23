import type { CwCascaderStyles } from './types'

export const defaultStyles: CwCascaderStyles = {
  root: 'cw-cascader w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  dropdown: 'min-w-0 max-w-full',
  panel: 'flex items-start gap-2 p-2',
  column: 'min-w-[8.75rem] max-h-[17.5rem] overflow-y-auto hairline-border-r last:hairline-border-r-0 border-[var(--component-border)]',
  option: 'whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200',
  optionNormal: 'text-[var(--text-color-primary)] cursor-pointer',
  optionSelected: 'text-[var(--brand-color-6)] bg-[var(--button-brand-tint-active-bg)] font-medium',
  optionDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed pointer-events-none',
  optionHover: 'hover:bg-[var(--bg-color-component-hover)]',
  optionFocus: 'bg-[var(--bg-color-secondarycontainer)]',
  optionContent: 'flex items-center justify-between gap-2',
  optionLabel: '',
  optionArrow: 'text-[var(--text-color-secondary)]',
  empty: 'px-5 py-10 text-center text-[var(--text-color-secondary)]',
  suffix: 'flex items-center justify-end gap-1 pr-2 flex-shrink-0',
  clearButton: 'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  // CwIcon 样式配置（清除图标）
  clearIconStyles: {
    root: 'inline-flex items-center justify-center text-current rounded-full',
    size: 1.125
  },
  arrowOpen: 'rotate-180',
  // CwIcon 样式配置（箭头图标）
  arrowIconStyles: {
    root: 'inline-flex items-center justify-center text-current text-[var(--text-color-secondary)] transition-transform duration-200',
    size: 1
  },
  // CwPopup 样式配置
  popupStyles: {
    popup: 'bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-lg overflow-hidden',
    trigger: 'inline-block w-full'
  },
  // 尺寸样式：小（选项列表）
  sizeSmall: 'px-2 py-1 text-xs',
  // 尺寸样式：中（选项列表）
  sizeMedium: 'px-3 py-2 text-sm',
  // 尺寸样式：大（选项列表）
  sizeLarge: 'px-4 py-2.5 text-base',
  // 空状态尺寸样式：小
  emptySizeSmall: 'text-xs',
  // 空状态尺寸样式：中
  emptySizeMedium: 'text-sm',
  // 空状态尺寸样式：大
  emptySizeLarge: 'text-base'
}
