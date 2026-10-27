import type { ReactNode } from 'react'
import { CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { showDynamicDialog } from '../CwDynamicDialog'
import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'
import { buildDialogModalContentClass } from '@zengchaowu/ui-shared/components/CwDynamicDialog/styles'
import CwTurnstileCaptchaDialogContent from './CwTurnstileCaptchaDialogContent'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/texts'
import type { ShowTurnstileCaptchaDialogOptions } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'
import type { CwTurnstileCaptchaDialogTexts, ShowTurnstileCaptchaDialogResult } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'

/**
 * 显示 Cloudflare Turnstile 安全验证弹窗。
 * @returns Promise：验证成功返回 token；关闭弹窗返回 `'cancel'`
 */
export function showTurnstileCaptchaDialog(
  options: ShowTurnstileCaptchaDialogOptions,
): Promise<ShowTurnstileCaptchaDialogResult> {
  return new Promise((resolve) => {
    const {
      siteKey,
      texts: customTexts,
      preloadPromise,
      widgetSize,
      dialogContentClass,
      onSuccess,
    } = options
    const dialogConfig: Partial<CwDynamicDialogConfig> = options.dialogConfig ?? {}

    if (!siteKey?.trim()) {
      resolve('cancel')
      return
    }

    const texts = { ...defaultTexts, ...customTexts } as CwTurnstileCaptchaDialogTexts

    const contentClass = [
      buildDialogModalContentClass({
        maxWidth: 'sm',
        appendClass: dialogContentClass,
      }),
      dialogConfig?.content?.class,
      'w-full max-w-sm min-w-0',
    ]
      .filter(Boolean)
      .join(' ')

    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    const settle = (result: ShowTurnstileCaptchaDialogResult) => {
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
      <CwTurnstileCaptchaDialogContent
        siteKey={siteKey}
        texts={texts}
        preloadPromise={preloadPromise}
        widgetSize={widgetSize}
        onSuccess={(token: string) => settle(token)}
        onFailed={() => {
          /* keep open for retry */
        }}
      />
    )

    const header: ReactNode = (
      <div className={CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS}>{texts.title}</div>
    )

    dialogInstance = showDynamicDialog({
      component: content,
      config: {
        ...dialogConfig,
        content: { class: contentClass },
        header: dialogConfig?.header ?? header,
        closeOnClickOutside: dialogConfig?.closeOnClickOutside ?? false,
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
export async function openTurnstileCaptchaToken(
  options: ShowTurnstileCaptchaDialogOptions,
): Promise<string | null> {
  const result = await showTurnstileCaptchaDialog(options)
  return result === 'cancel' ? null : result
}
