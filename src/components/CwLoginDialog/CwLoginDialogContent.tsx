import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { TokenPair } from '@zengchaowu/shared/types/auth'
import CwInput from '../CwInput/CwInput'
import CwSelect from '../CwSelect/CwSelect'
import CwButton from '../CwButton/CwButton'
import CwCheckbox from '../CwCheckbox/CwCheckbox'
import CwRichText from '../CwRichText/CwRichText'
import CwCountDownButton from '../CwCountDownButton/CwCountDownButton'
import CwIcon from '../CwIcon/CwIcon'
import CwNavBar from '../CwNavBar/CwNavBar'
import { CW_NAV_BAR_ICON_BUTTON_CLASS } from '@zengchaowu/ui-shared/components/CwNavBar/styles'
import { isPhone } from '@zengchaowu/shared/functions/validation/isPhone'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import { useWechatQrcodeLogin } from '../../hooks/useWechatQrcodeLogin'
import type {
  CwLoginDialogContentHandle,
  CwLoginDialogContentProps,
} from './types'

import { cwLoginDialogBase } from './styles'
import { formatOtpSentHint, buildLoginAgreementDsl } from '@zengchaowu/ui-shared/components/CwLoginDialog/functions'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwCountDownButtonExpose } from '../CwCountDownButton/types'

const NOOP_SUBSCRIBE = () => () => {}

const WECHAT_CONTAINER_ID = 'cw-login-dialog-wechat-wx-login'

const defaultCountryOptions = [{ label: '+86', value: '86' }]

const ribbonIconStyles: CwIconEmbed = {
  class: 'inline-flex translate-x-[0.2rem] -translate-y-[0.15rem]',
  size: 1.25,
}

const backArrowIconStyles: CwIconEmbed = {
  class: 'inline-flex text-[var(--text-color-primary)]',
  size: 1.25,
}

const helpIconStyles: CwIconEmbed = {
  class: 'inline-flex text-[var(--text-color-secondary)]',
  size: 1.25,
}

/**
 * CwLoginDialogContent（对应 vue-ui `CwLoginDialogContent.vue`）
 */
export const CwLoginDialogContent = forwardRef<
  CwLoginDialogContentHandle,
  CwLoginDialogContentProps
>(function CwLoginDialogContent(
  {
    loading: _loading = false,
    variant = 'full',
    initialPhone = '',
    initialDialCode = '86',
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
    carrierOneTap,
    carrierOneTapRef,
    onSuccess,
    onCancel,
    onRequestOtp,
    className,
    ...rest
  },
  ref,
) {
  const styles = cwLoginDialogBase

  const selectPopupClassResolved = selectPopupClass || undefined
  const selectPopupTriggerClassResolved =
    selectPopupTriggerClass ?? styles.selectPopupTriggerClass ?? ''

  const wechatEnabled = Boolean(generateWechatQrcode && pollWechatLogin)

  const [step, setStep] = useState<'entry' | 'otp'>(
    variant === 'otp' ? 'otp' : 'entry',
  )
  const [entryPanel, setEntryPanel] = useState<'phone' | 'qr'>('phone')
  const [isWide, setIsWide] = useState(false)

  /** 仅宽屏接 PC 微信扫码；窄屏 / 移动端只走手机号 */
  const showQrPanel = wechatEnabled && isWide

  const narrowNavTitle =
    step === 'otp' ? texts.otpNavTitle : texts.navTitle?.trim() || '登录'

  const [carrierLoading, setCarrierLoading] = useState(false)
  const carrierFromRef = useSyncExternalStore(
    carrierOneTapRef?.subscribe ?? NOOP_SUBSCRIBE,
    () => carrierOneTapRef?.current,
    () => undefined,
  )
  const carrierOneTapResolved = carrierFromRef ?? carrierOneTap
  const showCarrierOnSms =
    Boolean(carrierOneTapResolved) && !isWide && step === 'entry'

  const agreementDslResolved = useMemo(
    () =>
      agreementDsl != null
        ? agreementDsl
        : buildLoginAgreementDsl(texts.agreementPrefix, agreementLinks ?? []),
    [agreementDsl, agreementLinks, texts.agreementPrefix],
  )

  const showAgreementRow =
    agreementDsl != null ||
    (agreementLinks != null && agreementLinks.length > 0)

  const thirdPartyLinksResolved = thirdPartyLinks ?? []

  const resolvedCountryOptions = countryCodeOptions ?? defaultCountryOptions

  const [dialCode, setDialCode] = useState(
    initialDialCode?.trim() || '86',
  )
  const [phone, setPhone] = useState(
    String(initialPhone ?? '').replace(/\D/g, ''),
  )
  const [agreed, setAgreed] = useState(false)
  const [entryLoading, setEntryLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const [otpDigits, setOtpDigits] = useState('')
  const [otpInputFocused, setOtpInputFocused] = useState(false)
  const [otpError, setOtpError] = useState('')
  const otpInputRef = useRef<HTMLInputElement | null>(null)
  const resendBtnRef = useRef<CwCountDownButtonExpose | null>(null)
  const otpLoadingRef = useRef(otpLoading)
  otpLoadingRef.current = otpLoading

  /** 有协议行且未勾选时遮住扫码，并暂不拉起微信二维码 */
  const qrAgreementBlocked = showAgreementRow && !agreed

  // 媒体查询：宽/窄屏
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsWide(event.matches)
    }
    setIsWide(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleMediaChange)
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  // 勾选协议后清除全局错误
  useEffect(() => {
    if (agreed) setGlobalError('')
  }, [agreed])

  const {
    qrcodeReady,
    qrcodeHint,
    qrcodeLoading,
    start: startWechatQrcode,
    stop: stopWechatQrcode,
  } = useWechatQrcodeLogin({
    containerId: WECHAT_CONTAINER_ID,
    generateQrcode: async () => {
      if (!generateWechatQrcode) throw new Error('未配置微信扫码登录')
      return generateWechatQrcode()
    },
    pollLogin: async (options) => {
      if (!pollWechatLogin) throw new Error('未配置微信扫码登录')
      return pollWechatLogin(options)
    },
    onSuccess: async (pair: TokenPair) => {
      const accessToken = pair.accessToken?.trim()
      if (!accessToken) throw new Error('登录失败：未获取到 token')
      if (qrAgreementBlocked) {
        setGlobalError(texts.agreementRequiredError ?? '请先阅读并同意相关协议')
        return
      }
      if (onWechatSuccess) {
        await onWechatSuccess(pair)
      }
      onSuccess?.({ userInfo: pair, token: accessToken })
    },
  })

  const wechatPlaceholder = qrcodeLoading
    ? texts.qrPlaceholder || '正在加载二维码…'
    : qrcodeHint
      ? qrcodeHint
      : texts.qrPlaceholder || '正在加载二维码…'

  // 对应 Vue watch([wechatEnabled, isWide, step, qrAgreementBlocked], flush: 'post')
  useEffect(() => {
    if (!wechatEnabled || !isWide || step !== 'entry' || qrAgreementBlocked) {
      stopWechatQrcode()
      return
    }
    void startWechatQrcode()
  }, [
    wechatEnabled,
    isWide,
    step,
    qrAgreementBlocked,
    startWechatQrcode,
    stopWechatQrcode,
  ])

  const canGoNext = (() => {
    const phoneReady = phone.length === 11 && isPhone(phone)
    if (!showAgreementRow) return phoneReady
    return phoneReady && agreed
  })()

  const {
    isFocusVisible: ribbonFocusVisible,
    handleFocus: ribbonFvFocus,
    handleBlur: ribbonFvBlur,
  } = useBrowserFocusVisible()
  const ribbonTabindex = 0

  function toggleEntryPanel() {
    setEntryPanel((panel) => (panel === 'phone' ? 'qr' : 'phone'))
  }

  function onRibbonFocus() {
    ribbonFvFocus()
  }

  function onRibbonBlur() {
    ribbonFvBlur()
  }

  function onRibbonKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleEntryPanel()
    }
  }

  const {
    isFocusVisible: backFocusVisible,
    handleFocus: backFvFocus,
    handleBlur: backFvBlur,
  } = useBrowserFocusVisible()
  const backTabindex = otpLoading ? undefined : 0

  function onBackFocus() {
    if (otpLoading) return
    backFvFocus()
  }

  function onBackBlur() {
    backFvBlur()
  }

  function onBackKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (otpLoading) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goBackToEntry()
    }
  }

  const {
    isFocusVisible: helpFocusVisible,
    handleFocus: helpFvFocus,
    handleBlur: helpFvBlur,
  } = useBrowserFocusVisible()
  const helpTabindex = 0

  function onHelpFocus() {
    helpFvFocus()
  }

  function onHelpBlur() {
    helpFvBlur()
  }

  function onHelpKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOtpHelp()
    }
  }

  const otpHintDisplay = useMemo(
    () => formatOtpSentHint(texts.otpSentHint, dialCode, phone),
    [texts.otpSentHint, dialCode, phone],
  )

  const countDownButtonTextsMerged = useMemo(
    () => ({
      ...(texts.countDownButtonTexts ?? {}),
      idle: texts.sendCodeButton,
      counting: texts.countdownText.replace('{seconds}', '{{remaining}}'),
      finished: texts.sendCodeButton,
    }),
    [
      texts.countDownButtonTexts,
      texts.sendCodeButton,
      texts.countdownText,
    ],
  )

  // 进入验证码步骤后自动开始倒计时（对应 Vue watch step + nextTick）
  useLayoutEffect(() => {
    if (step !== 'otp') return
    resendBtnRef.current?.start({ skipBeforeStart: true })
  }, [step])

  // 6 位验证码输入完成后自动提交
  useEffect(() => {
    if (otpDigits.length !== 6 || otpLoadingRef.current) return
    let cancelled = false
    setOtpLoading(true)
    setOtpError('')
    void (async () => {
      try {
        const result = await onLogin?.(phone, otpDigits, dialCode)
        if (cancelled) return
        if (result?.success && result.token) {
          onSuccess?.({
            userInfo: result.userInfo ?? null,
            token: result.token,
          })
        } else {
          setOtpError(result?.error ?? texts.loginError)
          setOtpDigits('')
          if (otpInputRef.current) otpInputRef.current.value = ''
        }
      } catch (error: unknown) {
        if (cancelled) return
        setOtpError(
          error instanceof Error ? error.message : texts.loginErrorGeneral,
        )
        setOtpDigits('')
        if (otpInputRef.current) otpInputRef.current.value = ''
      } finally {
        if (!cancelled) setOtpLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // 仅在验证码变化时触发（对应 Vue watch(otpDigits)）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits])

  function onNarrowNavBack() {
    if (step === 'otp') {
      if (otpLoading) return
      if (variant === 'otp') {
        onCancel?.()
        return
      }
      goBackToEntry()
      return
    }
    onCancel?.()
  }

  function onPhoneInput(value: string) {
    setPhone(value.replace(/\D/g, ''))
    setGlobalError('')
  }

  function onAgreementRichLink(href: string, event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
    onAgreementLink?.(href)
  }

  function handleThirdParty(id: string) {
    onThirdPartyLogin?.(id)
  }

  async function handleCarrierTap() {
    if (carrierLoading) return
    setGlobalError('')
    setCarrierLoading(true)
    try {
      const result = await carrierOneTapResolved?.onLogin()
      if (result?.success && result.token) {
        onSuccess?.({ userInfo: result.userInfo, token: result.token })
        return
      }
      const errorMessage = result?.error?.trim()
      if (errorMessage) setGlobalError(errorMessage)
    } catch (error: unknown) {
      setGlobalError(
        error instanceof Error ? error.message : texts.loginErrorGeneral,
      )
    } finally {
      setCarrierLoading(false)
    }
  }

  async function handleNextStep() {
    if (!canGoNext || entryLoading) return
    setGlobalError('')
    setEntryLoading(true)
    try {
      if (!onSendCode) {
        setGlobalError(texts.sendCodeError)
        return
      }
      const result = await onSendCode(phone, dialCode)
      if (result?.success) {
        if (variant === 'entry') {
          onRequestOtp?.({ phone, dialCode })
          return
        }
        setStep('otp')
        setOtpDigits('')
        setOtpError('')
        requestAnimationFrame(() => focusOtpInput())
      } else {
        setGlobalError(result?.error ?? texts.sendCodeError)
      }
    } catch (error: unknown) {
      setGlobalError(
        error instanceof Error ? error.message : texts.sendCodeError,
      )
    } finally {
      setEntryLoading(false)
    }
  }

  function goBackToEntry() {
    if (otpLoading) return
    setStep('entry')
    setOtpDigits('')
    setOtpError('')
  }

  function handleOtpHelp() {
    onOtpHelp?.()
  }

  function focusOtpInput() {
    otpInputRef.current?.focus()
  }

  function handleOtpInput(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const digits = target.value.replace(/\D/g, '').slice(0, 6)
    setOtpDigits(digits)
    target.value = digits
    setOtpError('')
  }

  async function handleResendAsync(): Promise<boolean> {
    setOtpError('')
    try {
      if (!onSendCode) {
        setOtpError(texts.sendCodeError)
        return false
      }
      const result = await onSendCode(phone, dialCode)
      if (result?.success) return true
      setOtpError(result?.error ?? texts.sendCodeError)
      return false
    } catch (error: unknown) {
      setOtpError(
        error instanceof Error ? error.message : texts.sendCodeError,
      )
      return false
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setStep('entry')
        setEntryPanel('phone')
        setPhone('')
        setAgreed(false)
        setOtpDigits('')
        setGlobalError('')
        setOtpError('')
        stopWechatQrcode()
        if (otpInputRef.current) otpInputRef.current.value = ''
      },
    }),
    [stopWechatQrcode],
  )

  const rootClassList = [
    styles.root,
    isWide ? styles.rootWide : '',
    !isWide ? 'h-full min-h-0' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const stackWrapperClassList = [
    isWide ? '' : styles.rootStacked,
    !isWide ? 'flex min-h-0 flex-1 flex-col overflow-y-auto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} className={rootClassList}>
      {!isWide && (
        <CwNavBar
          appearance="full-width"
          bordered={false}
          title={narrowNavTitle}
          className="shrink-0"
          innerClass="px-1.5"
          texts={{ ariaLabel: narrowNavTitle }}
          leftSlot={
            <button
              type="button"
              className={CW_NAV_BAR_ICON_BUTTON_CLASS}
              aria-label={texts.backLabel}
              disabled={step === 'otp' && otpLoading}
              onClick={onNarrowNavBack}
            >
              <CwIcon
                name="common--dir--arrow-left-line"
                prefix="icon"
                size={1.25}
              />
            </button>
          }
          rightSlot={
            step === 'otp' ? (
              <button
                type="button"
                className={CW_NAV_BAR_ICON_BUTTON_CLASS}
                aria-label={texts.otpHelpLabel}
                onClick={handleOtpHelp}
              >
                <CwIcon
                  name="common--commerce--service-line"
                  prefix="icon"
                  size={1.25}
                />
              </button>
            ) : undefined
          }
        />
      )}

      <div className={stackWrapperClassList}>
        {/* 窄屏：右上角三角角标切换手机 / 扫码 */}
        {showQrPanel && !isWide && step === 'entry' && (
          <div className={styles.ribbonSlot}>
            <div
              role="button"
              tabIndex={ribbonTabindex}
              aria-label={
                entryPanel === 'phone'
                  ? texts.switchToQrLabel
                  : texts.switchToPhoneLabel
              }
              className={[
                styles.ribbon,
                styles.ribbonNormal,
                ribbonFocusVisible ? styles.ribbonFocused : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={toggleEntryPanel}
              onFocus={onRibbonFocus}
              onBlur={onRibbonBlur}
              onKeyDown={onRibbonKeydown}
            >
              <div
                className={styles.ribbonClip}
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
              >
                <div className={styles.ribbonClipInner}>
                  {entryPanel === 'phone' ? (
                    <CwIcon
                      name="common--social--qrcode-line"
                      prefix="icon"
                      size={ribbonIconStyles.size ?? 1}
                      className={ribbonIconStyles.class}
                    />
                  ) : (
                    <CwIcon
                      name="common--user--phone-line"
                      prefix="icon"
                      size={ribbonIconStyles.size ?? 1}
                      className={ribbonIconStyles.class}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 验证码步骤 */}
        {step === 'otp' && (
          <>
            {isWide && (
              <div className={styles.otpHeader}>
                <div
                  role="button"
                  tabIndex={backTabindex}
                  aria-label={texts.backLabel}
                  className={[
                    styles.otpBack,
                    styles.otpBackNormal,
                    backFocusVisible ? styles.otpBackFocused : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={goBackToEntry}
                  onFocus={onBackFocus}
                  onBlur={onBackBlur}
                  onKeyDown={onBackKeydown}
                >
                  <CwIcon
                    name="common--dir--arrow-left-line"
                    prefix="icon"
                    size={backArrowIconStyles.size ?? 1}
                    className={backArrowIconStyles.class}
                  />
                </div>
                <span className={styles.otpTitleBar}>{texts.otpNavTitle}</span>
                <div
                  role="button"
                  tabIndex={helpTabindex}
                  aria-label={texts.otpHelpLabel}
                  className={[
                    styles.otpHelp,
                    styles.otpHelpNormal,
                    helpFocusVisible ? styles.otpHelpFocused : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={handleOtpHelp}
                  onFocus={onHelpFocus}
                  onBlur={onHelpBlur}
                  onKeyDown={onHelpKeydown}
                >
                  <CwIcon
                    name="common--commerce--service-line"
                    prefix="icon"
                    size={helpIconStyles.size ?? 1}
                    className={helpIconStyles.class}
                  />
                </div>
              </div>
            )}
            {isWide && (
              <div className={styles.otpMainTitle}>{texts.otpMainTitle}</div>
            )}
            <p className={styles.otpSub}>{otpHintDisplay}</p>
            <div className="relative mt-2" onClick={focusOtpInput}>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={otpLoading}
                className={styles.otpHiddenInput}
                aria-label={texts.otpNavTitle}
                value={otpDigits}
                onChange={handleOtpInput}
                onFocus={() => setOtpInputFocused(true)}
                onBlur={() => setOtpInputFocused(false)}
              />
              <div className={styles.otpCellsRow} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={[
                      styles.otpCell,
                      index === otpDigits.length && otpInputFocused
                        ? styles.otpCellActive
                        : '',
                      otpDigits[index] ? styles.otpCellFilled : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {otpDigits[index] || ''}
                  </div>
                ))}
              </div>
            </div>
            {otpError && <div className={styles.otpError}>{otpError}</div>}
            <div className={styles.otpResendRow}>
              <CwCountDownButton
                ref={resendBtnRef}
                type="primary"
                variant="text"
                size="medium"
                beforeStart={handleResendAsync}
                disabled={otpLoading}
                texts={countDownButtonTextsMerged}
              />
            </div>
          </>
        )}

        {/* 手机 / 扫码 入口 */}
        {step === 'entry' && (
          <div
            className={[
              styles.entryLayout,
              showQrPanel && isWide
                ? styles.entryLayoutWide
                : styles.entryLayoutStacked,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div
              style={{
                display:
                  !showQrPanel || isWide || entryPanel === 'phone'
                    ? undefined
                    : 'none',
              }}
              className={[
                styles.phoneColumn,
                showQrPanel && isWide
                  ? styles.phoneColumnWide
                  : styles.phoneColumnStacked,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <h2
                className={[
                  styles.entryTitle,
                  showQrPanel && !isWide ? styles.entryTitleNarrow : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {texts.title}
              </h2>
              <div className={styles.phoneFormSpacerTop} aria-hidden="true" />
              <div className={styles.phoneFormBody}>
                <div className={styles.phoneRow}>
                  <div className={styles.countrySelectWrap}>
                    <CwSelect
                      value={dialCode}
                      size="medium"
                      options={resolvedCountryOptions}
                      disabled={entryLoading || carrierLoading}
                      clearable={false}
                      inputAppearance="embedded"
                      popupClass={selectPopupClassResolved}
                      popupTriggerClass={selectPopupTriggerClassResolved}
                      texts={texts.selectTexts}
                      onChange={(value) => setDialCode(String(value ?? '86'))}
                    />
                  </div>
                  <div className={styles.phoneInputWrap}>
                    <CwInput
                      value={phone}
                      type="tel"
                      maxLength={11}
                      size="medium"
                      placeholder={texts.phonePlaceholder}
                      showLabel={false}
                      clearable={false}
                      disabled={entryLoading || carrierLoading}
                      appearance="embedded"
                      className="w-full min-w-0"
                      texts={texts.inputTexts}
                      onChange={onPhoneInput}
                    />
                  </div>
                </div>
                {showCarrierOnSms && (
                  <div className={styles.nextButtonWrap}>
                    <CwButton
                      type="primary"
                      size="medium"
                      shape="rounded"
                      className={styles.nextButton}
                      disabled={carrierLoading || entryLoading}
                      loading={carrierLoading}
                      texts={texts.primaryButtonTexts}
                      onClick={handleCarrierTap}
                    >
                      {carrierLoading
                        ? texts.oneTapLoading || '登录中...'
                        : texts.oneTapButton || '手机号一键登录'}
                    </CwButton>
                  </div>
                )}
                <div className={styles.nextButtonWrap}>
                  <CwButton
                    type={showCarrierOnSms ? 'default' : 'primary'}
                    variant={showCarrierOnSms ? 'outline' : undefined}
                    size="medium"
                    shape="rounded"
                    className={styles.nextButton}
                    disabled={!canGoNext || entryLoading || carrierLoading}
                    loading={entryLoading}
                    texts={texts.primaryButtonTexts}
                    onClick={handleNextStep}
                  >
                    {entryLoading ? texts.nextStepLoading : texts.nextStep}
                  </CwButton>
                </div>
              </div>
              <div className={styles.phoneFormSpacer} aria-hidden="true" />
              <div className={styles.phoneFormFooter}>
                {showAgreementRow && (
                  <div className={styles.agreementRow}>
                    <CwCheckbox
                      value={agreed}
                      texts={texts.checkboxTexts}
                      onChange={(value) => setAgreed(value === true)}
                    >
                      {(scope) => (
                        <CwRichText
                          dsl={agreementDslResolved}
                          appearance="agreement"
                          disabled={scope.disabled}
                          size="medium"
                          texts={texts.richTextTexts}
                          onLinkClick={onAgreementRichLink}
                        />
                      )}
                    </CwCheckbox>
                  </div>
                )}
                {thirdPartyLinksResolved.length > 0 && (
                  <div className={styles.thirdPartyRow}>
                    {thirdPartyLinksResolved.map((link) => (
                      <div
                        key={link.id}
                        role="button"
                        tabIndex={0}
                        className={styles.thirdPartyLink}
                        onClick={() => handleThirdParty(link.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleThirdParty(link.id)
                          }
                        }}
                      >
                        {link.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showQrPanel && isWide && (
              <div className={styles.columnDivider} />
            )}

            {showQrPanel && (
              <div
                style={{
                  display: isWide || entryPanel === 'qr' ? undefined : 'none',
                }}
                className={[
                  styles.qrColumn,
                  isWide ? styles.qrColumnWide : styles.qrColumnStacked,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.qrFrame}>
                  <div
                    id={WECHAT_CONTAINER_ID}
                    className={styles.qrWxHost}
                    aria-label={texts.qrInstruction}
                  />
                  {!qrAgreementBlocked && !qrcodeReady && (
                    <span className="absolute inset-0 flex items-center justify-center bg-transparent px-3 text-center text-sm text-[var(--text-color-placeholder)]">
                      {wechatPlaceholder}
                    </span>
                  )}
                  {qrAgreementBlocked && (
                    <div className={styles.qrAgreementMask} role="status">
                      <p className={styles.qrAgreementMaskText}>
                        {texts.agreementRequiredError ??
                          '请先阅读并同意相关协议'}
                      </p>
                    </div>
                  )}
                </div>
                <p className={styles.qrHint}>{texts.qrInstruction}</p>
              </div>
            )}
          </div>
        )}

        {globalError && (
          <div className={styles.globalError}>{globalError}</div>
        )}
      </div>
    </div>
  )
})

export default CwLoginDialogContent
