import { showDynamicSheet } from '../CwDynamicSheet/showDynamicSheet'
import CwLoginPhoneDialogContent from '../CwLoginPhoneDialog/CwLoginPhoneDialogContent'
import type {
  showLoginPhoneSheetOptions,
  showLoginPhoneSheetResult,
} from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneDialog/texts'

/**
 * 显示手机号登录 Sheet（底部弹出）
 * @param options Sheet 配置选项
 * @returns Promise，resolve 时返回登录结果或 'cancel'
 */
export function showLoginPhoneSheet(
  options: showLoginPhoneSheetOptions = {},
): Promise<showLoginPhoneSheetResult | 'cancel'> {
  return new Promise((resolve) => {
    const { texts: customTexts, onSendCode, onLogin, onSuccess } = options

    const texts = { ...defaultTexts, ...customTexts }

    let sheetInstance: ReturnType<typeof showDynamicSheet> | null = null
    let isResolved = false

    const handleSuccess = (data: { userInfo: unknown; token: string }) => {
      if (isResolved) return
      isResolved = true
      if (sheetInstance) {
        sheetInstance.close()
      }
      setTimeout(() => {
        onSuccess?.(data)
        resolve(data)
      }, 300)
    }

    const content = (
      <CwLoginPhoneDialogContent
        loading={false}
        inputSize="large"
        layout="sheet"
        texts={texts}
        onSendCode={onSendCode}
        onLogin={onLogin}
        onSuccess={handleSuccess}
      />
    )

    const header = <div className={CW_OVERLAY_HEADER_TITLE_CLASS}>{texts.title}</div>

    sheetInstance = showDynamicSheet({
      content,
      config: {
        header,
        direction: 'bottom',
        closeOnClickOutside: true,
      },
    })

    sheetInstance.promise.then(() => {
      if (!isResolved) {
        setTimeout(() => {
          resolve('cancel')
        }, 300)
      }
    })
  })
}
