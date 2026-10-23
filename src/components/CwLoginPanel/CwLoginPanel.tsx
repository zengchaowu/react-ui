import { useMemo } from 'react'
import CwLoginMethodSwitch from '../CwLoginMethodSwitch/CwLoginMethodSwitch'
import CwLoginForm from '../CwLoginForm/CwLoginForm'
import CwButton from '../CwButton/CwButton'
import type { LoginMethodType } from '../CwLoginMethodSwitch/types'
import type { CwLoginPanelProps } from './types'
import { cwLoginPanelBase } from './styles'

export function CwLoginPanel({
  view = 'form',
  loading = false,
  qrcodeContainerId = '',
  qrcodeReady = false,
  texts,
  onSendCode,
  onLogin,
  onViewChange,
  onPrivacyClick,
  onForgotPasswordClick,
  onSsoClick,
  onRegisterClick,
  onAppleLoginClick,
  className,
  ...rest
}: CwLoginPanelProps) {
  const styles = cwLoginPanelBase

  const switchOptions = useMemo(
    () => [
      { label: texts.switchQrcodeLabel, value: 'qrcode' as const },
      { label: texts.switchPhoneLabel, value: 'phone' as const },
    ],
    [texts.switchQrcodeLabel, texts.switchPhoneLabel],
  )

  function handleViewChange(value: LoginMethodType) {
    onViewChange?.(value === 'qrcode' ? 'qrcode' : 'form')
  }

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <div className={styles.card}>
        {/* 右上角：登录方式切换（绝对定位） */}
        <div className={styles.switchSlot}>
          <CwLoginMethodSwitch
            value={view === 'form' ? 'phone' : 'qrcode'}
            options={switchOptions}
            onChange={handleViewChange}
          />
        </div>

        {/* 表单登录：复用 CwLoginForm，欢迎语通过 header 插槽与 segment 左对齐 */}
        {view === 'form' ? (
          <CwLoginForm
            loading={loading}
            onSendCode={onSendCode}
            onLogin={onLogin}
            texts={texts}
            onPrivacyClick={onPrivacyClick}
            onForgotPasswordClick={onForgotPasswordClick}
            headerSlot={
              <h1 className="text-2xl font-bold text-[var(--text-color-primary)] mb-2 pr-28">
                {texts.welcome}
              </h1>
            }
            footerSlot={
              <div className="flex flex-col gap-3 pt-3">
                <CwButton
                  variant="outline"
                  size="large"
                  className="w-full rounded-lg"
                  onClick={() => onSsoClick?.()}
                >
                  {texts.ssoLogin}
                </CwButton>
                <div className="text-center text-sm text-[var(--text-color-secondary)]">
                  {texts.noAccount}
                  <span
                    className="text-[var(--brand-color-6)] cursor-pointer hover:text-[var(--brand-color-hover)]"
                    onClick={() => onRegisterClick?.()}
                  >
                    {texts.register}
                  </span>
                </div>
              </div>
            }
          />
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 pt-14 pb-4">
              <h2 className="text-xl font-semibold text-[var(--success-color-6)]">
                {texts.wechatLoginTitle}
              </h2>
              <div className={styles.qrcodeBox}>
                {qrcodeContainerId && (
                  <div
                    id={qrcodeContainerId}
                    className={styles.qrcodeImage}
                    aria-label={texts.qrcodeImageAlt}
                  />
                )}
                {!qrcodeReady && (
                  <span className="text-[var(--text-color-placeholder)] text-sm absolute inset-0 flex items-center justify-center bg-white">
                    {texts.qrcodePlaceholder}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-color-secondary)] text-center">
                {texts.wechatLoginHint}
              </p>
              <CwButton
                variant="outline"
                size="large"
                className="w-full rounded-lg max-w-xs"
                onClick={() => onAppleLoginClick?.()}
              >
                {texts.appleLogin}
              </CwButton>
            </div>
            <div className={styles.wechatFooter}>
              <div className="text-xs text-[var(--text-color-secondary)] min-w-0">
                <p>{texts.wechatDisclaimer}</p>
                <p className="mt-1">
                  {texts.privacyAgreement}
                  <span
                    className="text-[var(--brand-color-6)] cursor-pointer"
                    onClick={() => onPrivacyClick?.()}
                  >
                    《{texts.privacyLink}》
                  </span>
                </p>
              </div>
              <span
                className="text-xs text-[var(--brand-color-6)] cursor-pointer hover:text-[var(--brand-color-hover)] whitespace-nowrap flex-shrink-0"
                onClick={() => onRegisterClick?.()}
              >
                {texts.phoneRegister}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CwLoginPanel
