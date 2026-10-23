import type { ReactNode } from 'react'
import { showDynamicDialog } from '../CwDynamicDialog'
import { buildDialogModalContentClass } from '../CwDynamicDialog/styles'
import CwSliderCaptchaDialogContent from './CwSliderCaptchaDialogContent'
import { defaultTexts } from './texts'
import type {
  CwSliderCaptchaDialogTexts,
  ShowSliderCaptchaDialogOptions,
  ShowSliderCaptchaDialogResult,
} from './types'

/**
 * 显示滑块安全验证弹窗。
 * @returns Promise：验证成功返回 captcha token；关闭弹窗返回 `'cancel'`
 */
export function showSliderCaptchaDialog(
  options: ShowSliderCaptchaDialogOptions,
): Promise<ShowSliderCaptchaDialogResult> {
  return new Promise((resolve) => {
    const {
      texts: customTexts,
      onGenerate,
      onVerify,
      onSuccess,
    } = options

    if (!onGenerate || !onVerify) {
      resolve('cancel')
      return
    }

    const texts = { ...defaultTexts, ...customTexts } as CwSliderCaptchaDialogTexts

    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    const settle = (result: ShowSliderCaptchaDialogResult) => {
      if (isResolved) return
      isResolved = true
      if (dialogInstance) dialogInstance.close()
      setTimeout(() => {
        if (typeof result === 'string' && result !== 'cancel') {
          onSuccess?.(result)
        }
        resolve(result)
      }, 300)
    }

    const content: ReactNode = (
      <CwSliderCaptchaDialogContent
        texts={texts}
        onGenerate={onGenerate}
        onVerify={onVerify}
        onSuccess={(token: string) => settle(token)}
        onFailed={() => {
          /* keep open for retry */
        }}
      />
    )

    dialogInstance = showDynamicDialog({
      component: content,
      config: {
        closeOnClickOutside: false,
        bodyScroll: false,
        showCloseButton: false,
        content: {
          class: buildDialogModalContentClass({
            maxWidth: 'none',
            appendClass:
              '!w-fit max-w-[calc(100vw-2rem)] min-w-0 overflow-x-hidden box-border !bg-transparent !p-0 !shadow-none',
          }),
        },
      },
    })

    void dialogInstance.promise.finally(() => {
      if (!isResolved) {
        setTimeout(() => resolve('cancel'), 300)
      }
    })
  })
}

/** 成功返回 token，关闭返回 null（站点发码流程常用） */
export async function openSliderCaptchaToken(
  options: ShowSliderCaptchaDialogOptions,
): Promise<string | null> {
  const result = await showSliderCaptchaDialog(options)
  return result === 'cancel' ? null : result
}
