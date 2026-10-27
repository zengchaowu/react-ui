import { showDynamicDialog } from '../CwDynamicDialog'
import { CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import CwLoginPhoneDialogContent from './CwLoginPhoneDialogContent'
import type { ShowLoginPhoneDialogOptions, ShowLoginPhoneDialogResult } from './types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneDialog/texts'

/**
 * 显示手机号登录弹窗（可选微信扫码）
 */
export function showLoginPhoneDialog(
  options: ShowLoginPhoneDialogOptions = {},
): Promise<ShowLoginPhoneDialogResult | 'cancel'> {
  return new Promise((resolve) => {
    const {
      texts: customTexts,
      onSendCode,
      onLogin,
      onSuccess,
      enableWechat = false,
      generateWechatQrcode,
      pollWechatLogin,
      onWechatSuccess,
    } = options

    const texts = { ...defaultTexts, ...customTexts }

    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    const handleSuccess = (data: { userInfo: unknown; token: string }) => {
      if (isResolved) return
      isResolved = true
      if (dialogInstance) {
        dialogInstance.close()
      }
      setTimeout(() => {
        onSuccess?.(data)
        resolve(data)
      }, 300)
    }

    dialogInstance = showDynamicDialog({
      component: (
        <CwLoginPhoneDialogContent
          loading={false}
          texts={texts}
          enableWechat={Boolean(enableWechat && generateWechatQrcode && pollWechatLogin)}
          generateWechatQrcode={generateWechatQrcode}
          pollWechatLogin={pollWechatLogin}
          onWechatSuccess={onWechatSuccess}
          onSendCode={onSendCode}
          onLogin={onLogin}
          onSuccess={handleSuccess}
        />
      ),
      config: {
        header: <div className={CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS}>{texts.title}</div>,
        closeOnClickOutside: true,
        content: {
          class: 'max-w-sm',
        },
      },
    })

    dialogInstance.promise.then(() => {
      if (!isResolved) {
        setTimeout(() => {
          resolve('cancel')
        }, 300)
      }
    })
  })
}
