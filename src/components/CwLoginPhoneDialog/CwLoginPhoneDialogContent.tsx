import { useEffect, useMemo, useRef, useState } from 'react'
import type { TokenPair } from '@zengchaowu/shared/types/auth'
import CwInput from '../CwInput/CwInput'
import CwButton from '../CwButton/CwButton'
import CwCountDownButton from '../CwCountDownButton/CwCountDownButton'
import CwLoginMethodSwitch from '../CwLoginMethodSwitch/CwLoginMethodSwitch'
import type { LoginMethodType } from '../CwLoginMethodSwitch/types'
import { isPhone } from '@zengchaowu/shared/functions/validation/isPhone'
import type { CwLoginPhoneDialogContentProps } from './types'
import {
  cwLoginPhoneDialogBase,
  phoneLoginSheetButtonGroupClass,
  phoneLoginSheetContentClass,
} from './styles'
import { defaultTexts } from './texts'
import { useWechatQrcodeLogin } from './useWechatQrcodeLogin'

const qrcodeContainerId = 'cw-login-phone-wechat-wx-login'

export function CwLoginPhoneDialogContent({
  loading = false,
  inputSize: inputSizeProp = 'medium',
  layout = 'dialog',
  texts: customTexts,
  enableWechat: enableWechatProp = false,
  generateWechatQrcode,
  pollWechatLogin,
  onWechatSuccess,
  onSendCode,
  onLogin,
  onSuccess,
  onUpdateLoginMethod,
  className,
  ...rest
}: CwLoginPhoneDialogContentProps) {
  const enableWechat = Boolean(enableWechatProp)
  const inputSize = inputSizeProp || 'medium'

  const styles = useMemo(() => {
    if (layout === 'sheet') {
      return {
        ...cwLoginPhoneDialogBase,
        content: phoneLoginSheetContentClass,
        buttonGroup: phoneLoginSheetButtonGroupClass,
      }
    }
    return cwLoginPhoneDialogBase
  }, [layout])

  const texts = useMemo(
    () => ({ ...defaultTexts, ...(customTexts ?? {}) }),
    [customTexts],
  )

  const [loginMethod, setLoginMethod] = useState<LoginMethodType>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')

  const canSendCode = phone.length === 11 && isPhone(phone)

  const canLogin =
    phone.length === 11 &&
    isPhone(phone) &&
    code.length >= 4 &&
    code.length <= 6

  const countDownButtonTexts = useMemo(
    () => ({
      ...(texts.countDownButtonTexts ?? {}),
      idle: texts.sendCodeButton,
      counting: texts.countdownText.replace('{seconds}', '{{remaining}}'),
      finished: texts.sendCodeButton,
    }),
    [texts],
  )

  const {
    qrcodeReady,
    qrcodeHint,
    qrcodeLoading,
    start: startWechatQrcode,
    stop: stopWechatQrcode,
  } = useWechatQrcodeLogin({
    containerId: qrcodeContainerId,
    generateQrcode: async () => {
      if (!generateWechatQrcode) {
        throw new Error('未配置微信扫码登录')
      }
      return generateWechatQrcode()
    },
    pollLogin: async (options) => {
      if (!pollWechatLogin) {
        throw new Error('未配置微信扫码登录')
      }
      return pollWechatLogin(options)
    },
    onSuccess: async (pair: TokenPair) => {
      const accessToken = pair.accessToken?.trim()
      if (!accessToken) {
        throw new Error('登录失败：未获取到 token')
      }
      if (onWechatSuccess) {
        await onWechatSuccess(pair)
      }
      onSuccess?.({
        userInfo: pair,
        token: accessToken,
      })
    },
  })

  const isFirstLoginMethodEffectRef = useRef(true)
  useEffect(() => {
    if (isFirstLoginMethodEffectRef.current) {
      isFirstLoginMethodEffectRef.current = false
      return
    }
    if (loginMethod === 'qrcode' && enableWechat) {
      void startWechatQrcode()
    } else {
      stopWechatQrcode()
    }
  }, [loginMethod, enableWechat, startWechatQrcode, stopWechatQrcode])

  const qrcodePlaceholder = qrcodeLoading
    ? '正在加载二维码…'
    : qrcodeHint
      ? qrcodeHint
      : texts.qrcodePlaceholder

  const handleLoginMethodChange = (next: LoginMethodType) => {
    if (!enableWechat && next === 'qrcode') return
    setLoginMethod(next)
    onUpdateLoginMethod?.(next)
  }

  const handlePhoneInput = (value: string) => {
    setPhoneError('')
    setError('')
    setPhone(value.replace(/\D/g, ''))
  }

  const handleCodeInput = (value: string) => {
    setCodeError('')
    setError('')
    setCode(value.replace(/\D/g, ''))
  }

  const handleAsyncSendCode = async (): Promise<boolean> => {
    if (!canSendCode) {
      return false
    }

    setPhoneError('')
    setError('')

    try {
      if (!onSendCode) {
        setPhoneError(texts.sendCodeError)
        return false
      }

      const result = await onSendCode(phone)

      if (result?.success) {
        return true
      }
      setPhoneError(result?.error || texts.sendCodeError)
      return false
    } catch (err: unknown) {
      setPhoneError(err instanceof Error ? err.message : texts.sendCodeError)
      return false
    }
  }

  const handleSendCodeSuccess = () => {
    setPhoneError('')
  }

  const handleSendCodeError = (err: unknown) => {
    setPhoneError(err instanceof Error ? err.message : texts.sendCodeError)
  }

  const handleLogin = async () => {
    if (!canLogin || loading) return

    setCodeError('')
    setError('')

    try {
      if (!onLogin) {
        setError(texts.loginErrorGeneral)
        return
      }

      const result = await onLogin(phone, code)

      if (result?.success && result.token) {
        onSuccess?.({ userInfo: result.userInfo, token: result.token })
        return
      }
      setCodeError(result?.error || texts.loginError)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : texts.loginErrorGeneral)
    }
  }

  return (
    <div
      {...rest}
      className={[styles.content, className, 'relative'].filter(Boolean).join(' ')}
    >
      {enableWechat && (
        <div className="absolute top-0 right-0 z-[var(--z-index-sticky)]">
          <CwLoginMethodSwitch
            value={loginMethod}
            onChange={handleLoginMethodChange}
          />
        </div>
      )}

      {loginMethod === 'phone' ? (
        <>
          <div className={[styles.inputGroup, enableWechat ? 'pt-8' : ''].filter(Boolean).join(' ')}>
            <CwInput
              size={inputSize}
              value={phone}
              label={texts.phoneLabel}
              placeholder={texts.phonePlaceholder}
              showLabel={false}
              type="tel"
              maxLength={11}
              disabled={loading}
              texts={texts.inputTexts}
              onChange={handlePhoneInput}
            />
            {phoneError && <div className={styles.errorMessage}>{phoneError}</div>}
          </div>

          <div className={styles.inputGroup}>
            <CwInput
              size={inputSize}
              value={code}
              label={texts.codeLabel}
              placeholder={texts.codePlaceholder}
              showLabel={false}
              type="text"
              maxLength={6}
              disabled={loading}
              texts={texts.inputTexts}
              onChange={handleCodeInput}
              suffix={
                <CwCountDownButton
                  size="small"
                  variant="text"
                  block
                  beforeStart={handleAsyncSendCode}
                  disabled={!canSendCode || loading}
                  texts={countDownButtonTexts}
                  onCountdownStart={handleSendCodeSuccess}
                  onBeforeStartError={handleSendCodeError}
                />
              }
            />
            {codeError && <div className={styles.errorMessage}>{codeError}</div>}
          </div>

          {error && (
            <div className={[styles.errorMessage, styles.globalError].filter(Boolean).join(' ')}>
              {error}
            </div>
          )}

          <div className={styles.buttonGroup}>
            <CwButton
              type="primary"
              size="medium"
              className="w-full"
              disabled={!canLogin || loading}
              loading={loading}
              texts={texts.buttonTexts}
              onClick={handleLogin}
            >
              {loading ? texts.loggingIn : texts.loginButton}
            </CwButton>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 pt-10 pb-2">
          <h2 className="text-base font-semibold text-[var(--text-color-primary)]">
            {texts.wechatLoginTitle}
          </h2>
          <div className="relative w-[13.75rem] h-[13.75rem] bg-white border border-[var(--border-color)] rounded-lg flex items-center justify-center overflow-hidden">
            {qrcodeContainerId && (
              <div
                id={qrcodeContainerId}
                className="w-full h-full border-0 bg-white [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
                aria-label={texts.qrcodeImageAlt}
              />
            )}
            {!qrcodeReady && (
              <span className="text-[var(--text-color-placeholder)] text-sm absolute inset-0 flex items-center justify-center bg-white px-3 text-center">
                {qrcodePlaceholder}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-color-secondary)] text-center">
            {texts.wechatLoginHint}
          </p>
        </div>
      )}
    </div>
  )
}

export default CwLoginPhoneDialogContent
