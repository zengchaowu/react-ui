import type { CwPhoneLoginDialogStyles } from './types'

export const defaultStyles: CwPhoneLoginDialogStyles = {
  /** 不再加 padding：外层 CwDynamicDialog body（px-4 py-3）与 CwDynamicSheet body（p-4）已负责留白 */
  content: 'min-w-0 w-full',
  inputGroup: 'mb-2',
  errorMessage: 'text-xs text-[var(--error-color-6)] mt-1',
  globalError: 'mt-3 mb-0 p-3 bg-[var(--error-color-light)] border border-[var(--error-color-focus)] rounded-lg',
  buttonGroup: 'mt-2 w-full',
  loginButton: 'w-full',
}
