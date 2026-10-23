import { readIsBelowMdViewport } from '@zengchaowu/shared/functions/browser/readLayoutViewportSignals'
import {
  APP_OVERLAY_SAFE_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_TOP_CLASS,
} from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import { showDynamicDialog } from '../CwDynamicDialog'
import { buildDialogModalContentClass } from '../CwDynamicDialog/styles'
import CwLoginDialogContent from './CwLoginDialogContent'
import CwLoginDialogMobileStack from './CwLoginDialogMobileStack'
import type {
  CwLoginDialogContentProps,
  ShowLoginDialogOptions,
  ShowLoginDialogResult,
} from './types'

type ContentSharedProps = Pick<
  CwLoginDialogContentProps,
  | 'texts'
  | 'selectPopupClass'
  | 'selectPopupTriggerClass'
  | 'countryCodeOptions'
  | 'agreementLinks'
  | 'agreementDsl'
  | 'thirdPartyLinks'
  | 'generateWechatQrcode'
  | 'pollWechatLogin'
  | 'onWechatSuccess'
  | 'onSendCode'
  | 'onLogin'
  | 'onAgreementLink'
  | 'onThirdPartyLogin'
  | 'onOtpHelp'
  | 'carrierOneTap'
  | 'carrierOneTapRef'
>

/**
 * 显示登录弹窗（宽屏双栏 / 窄屏全屏栈），对应 vue-ui `showLoginDialog`。
 */
export function showLoginDialog(
  options: ShowLoginDialogOptions,
): Promise<ShowLoginDialogResult | 'cancel'> {
  return new Promise((resolve) => {
    const {
      texts,
      dialogContentClass,
      dialogBodyClass,
      selectPopupClass,
      selectPopupTriggerClass,
      countryCodeOptions,
      agreementLinks,
      agreementDsl,
      thirdPartyLinks,
      generateWechatQrcode,
      pollWechatLogin,
      onWechatSuccess,
      onSendCode,
      onLogin,
      onAgreementLink,
      onThirdPartyLogin,
      onOtpHelp,
      onSuccess,
      carrierOneTap,
      carrierOneTapRef,
    } = options

    const isBelowMd = readIsBelowMdViewport()
    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    const carrierLive = carrierOneTapRef?.current ?? carrierOneTap

    const contentProps: ContentSharedProps = {
      texts,
      selectPopupClass,
      selectPopupTriggerClass,
      countryCodeOptions,
      agreementLinks,
      agreementDsl,
      thirdPartyLinks,
      generateWechatQrcode,
      pollWechatLogin,
      onWechatSuccess,
      onSendCode,
      onLogin,
      onAgreementLink,
      onThirdPartyLogin,
      onOtpHelp,
      carrierOneTap: carrierLive,
      carrierOneTapRef,
    }

    const settle = (value: ShowLoginDialogResult | 'cancel') => {
      if (isResolved) return
      isResolved = true
      dialogInstance?.close()
      setTimeout(() => {
        if (value !== 'cancel') onSuccess?.(value)
        resolve(value)
      }, 300)
    }

    const handleSuccess = (data: ShowLoginDialogResult) => {
      settle(data)
    }

    const content = isBelowMd ? (
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <CwLoginDialogMobileStack
          {...contentProps}
          onSuccess={handleSuccess}
          onCancel={() => settle('cancel')}
        />
      </div>
    ) : (
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <CwLoginDialogContent
          loading={false}
          {...contentProps}
          onSuccess={handleSuccess}
          onCancel={() => settle('cancel')}
        />
      </div>
    )

    const bodyExtra = dialogBodyClass?.trim() ?? ''

    dialogInstance = showDynamicDialog({
      component: content,
      config: isBelowMd
        ? {
            variant: 'fullscreen',
            bodyPadding: false,
            bodyScroll: false,
            showCloseButton: false,
            closeOnClickOutside: false,
            content: {
              class: [
                '!bg-[var(--bg-color-container)]',
                APP_OVERLAY_SAFE_TOP_CLASS,
                APP_OVERLAY_SAFE_BOTTOM_CLASS,
              ].join(' '),
            },
          }
        : {
            showCloseButton: false,
            closeOnClickOutside: true,
            bodyPadding: false,
            bodyScroll: false,
            contentTransition: 'fade',
            content: {
              class: buildDialogModalContentClass({
                maxWidth: 'unlock',
                appendClass: dialogContentClass,
              }),
            },
            ...(bodyExtra ? { body: { class: bodyExtra } } : {}),
          },
    })

    void dialogInstance.promise.then(() => {
      if (!isResolved) settle('cancel')
    })
  })
}

export default showLoginDialog
