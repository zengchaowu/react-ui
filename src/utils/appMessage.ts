import { showConfirmDialog } from '../components/CwConfirmDialog'
import { showCwToast } from '../components/CwToast/showCwToast'
import type { ShowCwToastOptions } from '../components/CwToast/showCwToast'
import { apiErrorMessageFrom } from '@zengchaowu/shared/functions/api/apiErrorMessageFrom'

type CwToastType = NonNullable<ShowCwToastOptions['type']>

const toastDuration = 2500

export type AppMessageToastType = 'info' | 'success' | 'error' | 'warning'

/** Only toast when the error carries a backend/request message */
export function showApiError(
  e: unknown,
  type: 'error' | 'warning' = 'error',
): void {
  const msg = apiErrorMessageFrom(e)
  if (msg) showMessage(msg, type)
}

export function showMessage(
  message: string,
  type: AppMessageToastType = 'info',
): void {
  const text = String(message ?? '').trim()
  if (!text) return
  const cwType: CwToastType = type === 'success' ? 'success' : 'text'
  showCwToast({
    message: text,
    type: cwType,
    duration: toastDuration,
  })
}

export async function showConfirm(
  message: string,
  title: string = '确认',
  confirmText: string = '确定',
  cancelText: string = '取消',
): Promise<boolean> {
  const result = await showConfirmDialog({
    title,
    message,
    confirmText,
    cancelText,
  })
  return result === 'confirm'
}
