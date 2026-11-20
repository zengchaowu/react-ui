import { createAppMessage } from '@zengchaowu/ui-shared/utils/appMessage'
import { showConfirmDialog } from '../components/CwConfirmDialog'
import { showCwToast } from '../components/CwToast/showCwToast'

export type { AppMessageToastType } from '@zengchaowu/ui-shared/utils/appMessage'

/** 通用文案与提示规则在 ui-shared，本文件只绑定 React 端的 Toast / 确认框实现 */
const appMessage = createAppMessage({
  showToast: showCwToast,
  showConfirmDialog,
})

export const showApiError = appMessage.showApiError
export const showMessage = appMessage.showMessage
export const showConfirm = appMessage.showConfirm
