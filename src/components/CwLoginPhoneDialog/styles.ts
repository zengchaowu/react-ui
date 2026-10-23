import type { CwLoginPhoneDialogStyles } from './types'

export const cwLoginPhoneDialogBase: CwLoginPhoneDialogStyles = {
  /** 不再加 padding：外层 CwDynamicDialog body（px-4 py-3）与 CwDynamicSheet body（p-4）已负责留白 */
  content: 'min-w-0 w-full',
  inputGroup: 'mb-2',
  errorMessage: 'text-xs text-[var(--error-color-6)] mt-1',
  globalError: 'mt-3 mb-0 p-3 bg-[var(--error-color-light)] border border-[var(--error-color-focus)] rounded-lg',
  buttonGroup: 'mt-2 w-full',
  loginButton: 'w-full',
}

/** Sheet 底栏弹出：与外层 body（p-4）对齐，不在内容区重复 px */
export const phoneLoginSheetContentClass = 'min-w-0 w-full px-0 pb-4'
export const phoneLoginSheetButtonGroupClass = 'mt-1 w-full'
