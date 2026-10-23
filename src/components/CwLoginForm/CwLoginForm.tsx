import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import CwSegment from '../CwSegment/CwSegment'
import CwInput from '../CwInput/CwInput'
import CwButton from '../CwButton/CwButton'
import CwCheckbox from '../CwCheckbox/CwCheckbox'
import CwCountDownButton from '../CwCountDownButton/CwCountDownButton'
import { isPhone } from '@zengchaowu/shared/functions/validation/isPhone'
import { isEmail } from '@zengchaowu/shared/functions/validation/isEmail'
import type {
  CwLoginFormHandle,
  CwLoginFormProps,
  CwLoginMethod,
} from './types'
import { cwLoginFormBase } from './styles'

export const CwLoginForm = forwardRef<CwLoginFormHandle, CwLoginFormProps>(
  function CwLoginForm(
    {
      loading = false,
      texts,
      onSendCode,
      onLogin,
      onSendCodeRequest,
      onLoginSubmit,
      onPrivacyClick,
      onForgotPasswordClick,
      headerSlot,
      footerSlot,
      className,
      ...rest
    },
    ref,
  ) {
    const styles = cwLoginFormBase

    const segmentOptions = useMemo(
      () => [
        { label: texts.segmentSms, value: 'sms' as const },
        { label: texts.segmentPassword, value: 'password' as const },
      ],
      [texts.segmentSms, texts.segmentPassword],
    )

    const [loginMethod, setLoginMethod] = useState<CwLoginMethod>('sms')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [agreePrivacy, setAgreePrivacy] = useState(false)
    const [error, setError] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [codeError, setCodeError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const canSendCode = phone.length === 11 && isPhone(phone)

    const canLogin =
      agreePrivacy &&
      (loginMethod === 'sms'
        ? isPhone(phone) && code.length >= 4 && code.length <= 6
        : (isPhone(phone) || isEmail(phone)) && password.length >= 6)

    const countDownButtonTexts = useMemo(
      () => ({
        idle: texts.sendCodeButton,
        counting: '{{remaining}}s',
        finished: texts.sendCodeButton,
      }),
      [texts.sendCodeButton],
    )

    function handleMethodChange(value: string | number) {
      setLoginMethod(value === 'password' ? 'password' : 'sms')
      setError('')
      setPhoneError('')
      setCodeError('')
      setPasswordError('')
    }

    function handlePhoneInput(value: string) {
      setPhoneError('')
      setError('')
      setPhone(loginMethod === 'sms' ? value.replace(/\D/g, '') : value)
    }

    function handleCodeInput(value: string) {
      setCodeError('')
      setError('')
      setCode(value.replace(/\D/g, ''))
    }

    function handlePasswordInput(value: string) {
      setPasswordError('')
      setError('')
      setPassword(value)
    }

    async function handleAsyncSendCode(): Promise<boolean> {
      if (!canSendCode) return false
      setPhoneError('')
      setError('')
      try {
        if (onSendCode) {
          const result = await onSendCode(phone)
          if (result?.success !== false) return true
          setPhoneError(result?.error || texts.sendCodeError)
          return false
        }
        onSendCodeRequest?.(phone)
        return true
      } catch (e: unknown) {
        setPhoneError(e instanceof Error ? e.message : texts.sendCodeError)
        return false
      }
    }

    async function handleLogin() {
      if (!canLogin || loading) return
      setError('')
      setPhoneError('')
      setCodeError('')
      setPasswordError('')
      const payload = loginMethod === 'sms' ? code : password
      if (onLogin) {
        try {
          const result = await onLogin(phone, payload, loginMethod)
          if (result?.success !== true && result?.error) {
            if (loginMethod === 'sms') setCodeError(result.error)
            else setPasswordError(result.error)
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : texts.loginErrorGeneral)
        }
      } else {
        onLoginSubmit?.(phone, payload, loginMethod)
      }
    }

    function handlePrivacyClick() {
      onPrivacyClick?.()
    }

    useImperativeHandle(ref, () => ({
      setError: (msg: string) => setError(msg),
      setPhoneError: (msg: string) => setPhoneError(msg),
      setCodeError: (msg: string) => setCodeError(msg),
      setPasswordError: (msg: string) => setPasswordError(msg),
    }), [])

    return (
      <div
        {...rest}
        className={[styles.container, className].filter(Boolean).join(' ')}
      >
        <div className={styles.content}>
          {/* 顶部插槽：如欢迎语，与 segment 左对齐 */}
          {headerSlot}

          {/* 登录方式切换 */}
          <div className={styles.segmentGroup}>
            <CwSegment
              value={loginMethod}
              options={segmentOptions}
              onChange={handleMethodChange}
            />
          </div>

          {/* 手机号/邮箱输入 */}
          <div className={styles.inputGroup}>
            <CwInput
              value={phone}
              placeholder={
                loginMethod === 'sms'
                  ? texts.phonePlaceholder
                  : texts.phoneOrEmailPlaceholder
              }
              showLabel={false}
              type={loginMethod === 'sms' ? 'tel' : 'text'}
              size="large"
              disabled={loading}
              onChange={handlePhoneInput}
            />
            {phoneError && <div className={styles.errorMessage}>{phoneError}</div>}
          </div>

          {/* 验证码输入（短信登录） */}
          {loginMethod === 'sms' ? (
            <div className={styles.inputGroup}>
              <CwInput
                value={code}
                placeholder={texts.codePlaceholder}
                showLabel={false}
                type="text"
                size="large"
                disabled={loading}
                onChange={handleCodeInput}
                suffix={
                  <CwCountDownButton
                    variant="text"
                    size="large"
                    beforeStart={handleAsyncSendCode}
                    disabled={!canSendCode || loading}
                    texts={countDownButtonTexts}
                  />
                }
              />
              {codeError && <div className={styles.errorMessage}>{codeError}</div>}
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <CwInput
                value={password}
                placeholder={texts.passwordPlaceholder}
                showLabel={false}
                type={passwordVisible ? 'text' : 'password'}
                size="large"
                disabled={loading}
                clearable={false}
                onChange={handlePasswordInput}
                suffix={
                  <span
                    className="pr-2 text-[var(--text-color-secondary)] cursor-pointer text-sm"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                  >
                    {passwordVisible
                      ? texts.hidePasswordLabel
                      : texts.showPasswordLabel}
                  </span>
                }
              />
              {passwordError && (
                <div className={styles.errorMessage}>{passwordError}</div>
              )}
            </div>
          )}

          {/* 全局错误 */}
          {error && (
            <div
              className={[styles.errorMessage, styles.globalError]
                .filter(Boolean)
                .join(' ')}
            >
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <div className={styles.buttonGroup}>
            <CwButton
              type="primary"
              size="large"
              disabled={!canLogin || loading}
              loading={loading}
              className="w-full rounded-lg"
              onClick={handleLogin}
            >
              {loading ? texts.loggingIn : texts.loginButton}
            </CwButton>
          </div>

          {/* 隐私政策 + 忘记密码 */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className={styles.privacyGroup}>
              <CwCheckbox
                value={agreePrivacy}
                disabled={loading}
                onChange={(value) => setAgreePrivacy(value === true)}
              >
                <span className="text-sm text-[var(--text-color-secondary)]">
                  {texts.privacyPrefix}
                  <span
                    className={styles.privacyLink}
                    onClick={(event) => {
                      event.stopPropagation()
                      handlePrivacyClick()
                    }}
                  >
                    {texts.privacyLink}
                  </span>
                </span>
              </CwCheckbox>
            </div>
            {loginMethod === 'password' && (
              <span
                className="text-sm text-[var(--text-color-secondary)] cursor-pointer hover:text-[var(--brand-color-6)] shrink-0"
                onClick={() => onForgotPasswordClick?.()}
              >
                {texts.forgotPassword}
              </span>
            )}
          </div>

          {footerSlot}
        </div>
      </div>
    )
  },
)

export default CwLoginForm
