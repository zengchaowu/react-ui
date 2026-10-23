import { useEffect, useMemo, useRef } from 'react'
import { CwStack } from '../CwStack'
import type { CwStackComponent, CwStackExposed } from '../CwStack'
import CwLoginDialogContent from './CwLoginDialogContent'
import type {
  CwLoginDialogContentProps,
  CwLoginDialogMobileStackProps,
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

function buildContentProps(
  props: CwLoginDialogMobileStackProps,
): ContentSharedProps {
  return {
    texts: props.texts,
    selectPopupClass: props.selectPopupClass,
    selectPopupTriggerClass: props.selectPopupTriggerClass,
    countryCodeOptions: props.countryCodeOptions,
    agreementLinks: props.agreementLinks,
    agreementDsl: props.agreementDsl,
    thirdPartyLinks: props.thirdPartyLinks,
    generateWechatQrcode: props.generateWechatQrcode,
    pollWechatLogin: props.pollWechatLogin,
    onWechatSuccess: props.onWechatSuccess,
    onSendCode: props.onSendCode,
    onLogin: props.onLogin,
    onAgreementLink: props.onAgreementLink,
    onThirdPartyLogin: props.onThirdPartyLogin,
    onOtpHelp: props.onOtpHelp,
    carrierOneTap: props.carrierOneTapRef?.current ?? props.carrierOneTap,
    carrierOneTapRef: props.carrierOneTapRef,
  }
}

/**
 * 窄屏登录页栈：入口页 + 验证码页（对应 vue-ui `CwLoginDialogMobileStack.vue`）
 */
export function CwLoginDialogMobileStack(
  props: CwLoginDialogMobileStackProps,
) {
  const stackRef = useRef<CwStackExposed | null>(null)
  const initializedRef = useRef(false)
  const propsRef = useRef(props)
  propsRef.current = props

  const OtpPage = useMemo<CwStackComponent>(() => {
    function CwLoginDialogMobileOtpPage(
      pageProps: Record<string, unknown>,
    ) {
      const current = propsRef.current
      const phone = typeof pageProps.phone === 'string' ? pageProps.phone : ''
      const dialCode =
        typeof pageProps.dialCode === 'string' ? pageProps.dialCode : '86'
      const close =
        typeof pageProps.close === 'function'
          ? (pageProps.close as () => void)
          : () => undefined

      return (
        <CwLoginDialogContent
          {...buildContentProps(current)}
          variant="otp"
          initialPhone={phone}
          initialDialCode={dialCode}
          onSuccess={(data) => current.onSuccess?.(data)}
          onCancel={close}
        />
      )
    }
    return CwLoginDialogMobileOtpPage
  }, [])

  const EntryPage = useMemo<CwStackComponent>(() => {
    function CwLoginDialogMobileEntryPage() {
      const current = propsRef.current
      return (
        <CwLoginDialogContent
          {...buildContentProps(current)}
          variant="entry"
          onSuccess={(data) => current.onSuccess?.(data)}
          onCancel={() => current.onCancel?.()}
          onRequestOtp={(payload) => {
            stackRef.current?.push(OtpPage, {
              phone: payload.phone,
              dialCode: payload.dialCode,
              close: () => stackRef.current?.pop(),
            })
          }}
        />
      )
    }
    return CwLoginDialogMobileEntryPage
  }, [OtpPage])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack || initializedRef.current) return
    stack.push(EntryPage)
    initializedRef.current = true
  }, [EntryPage])

  return (
    <CwStack
      ref={stackRef}
      slideTransition
      className={[
        'flex h-full min-h-0 min-w-0 w-full flex-1 flex-col',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export default CwLoginDialogMobileStack
