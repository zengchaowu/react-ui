import type { CwEditableEmailStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwEditableEmailStyles = {
  // 根容器：基础 + 状态
  root: 'cw-editable-email inline-flex items-center',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 预览容器：基础 + 状态 + 聚焦
  previewContainer: 'flex items-center gap-2 outline-none focus:outline-none',
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
  editIconContainer: 'flex items-center justify-center outline-none',
  editIconContainerNormal: 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer',
  editIconContainerDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  editIconContainerReadonly: 'text-[var(--text-color-secondary)] cursor-default',

  // 编辑容器：包裹输入框和 loading
  editContainer: 'flex items-center gap-2',
  
  // Loading：基础样式
  loadingContainer: 'flex items-center justify-center flex-shrink-0',
  
  // 子组件样式配置（必须作为独立子对象，多层嵌套）
  iconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1
  },
  
  // CwAutoCompleteEmail -> CwAutoComplete -> CwInput 多层样式配置
  autoCompleteEmailStyles: {
    root: 'w-full',
    // CwAutoComplete 样式配置
    autoCompleteStyles: {
      // CwInput 样式配置（与 CwEditableText 保持一致）
    }
  },
  
  loadingStyles: {}
}

