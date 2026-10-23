import type { HTMLAttributes, ReactNode } from 'react'

export type CwLoginMethod = 'sms' | 'password'

export interface CwLoginFormStyles {
  container: string
  content: string
  segmentGroup: string
  inputGroup: string
  errorMessage: string
  globalError: string
  buttonGroup: string
  privacyGroup: string
  privacyLink: string
}

/** 短信/密码登录表单文案，均由调用方传入 */
export interface CwLoginFormTexts {
  segmentSms: string
  segmentPassword: string
  phonePlaceholder: string
  phoneOrEmailPlaceholder: string
  codePlaceholder: string
  passwordPlaceholder: string
  sendCodeButton: string
  loginButton: string
  loggingIn: string
  privacyPrefix: string
  privacyLink: string
  forgotPassword: string
  showPasswordLabel: string
  hidePasswordLabel: string
  sendCodeError: string
  loginError: string
  loginErrorGeneral: string
}

export interface CwLoginFormProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  loading?: boolean
  /** 展示文案（必填，由业务侧传入） */
  texts: CwLoginFormTexts
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string } | void>
  onLogin?: (
    phone: string,
    codeOrPassword: string,
    method: CwLoginMethod,
  ) => Promise<{ success: boolean; token?: string; userInfo?: unknown; error?: string } | void>
  /** 未传 `onSendCode` 时发出的发送验证码事件 */
  onSendCodeRequest?: (phone: string) => void
  /** 未传 `onLogin` 时发出的登录事件 */
  onLoginSubmit?: (phone: string, codeOrPassword: string, method: CwLoginMethod) => void
  onPrivacyClick?: () => void
  onForgotPasswordClick?: () => void
  /** `header` 具名插槽 */
  headerSlot?: ReactNode
  /** `footer` 具名插槽 */
  footerSlot?: ReactNode
  className?: string
}

/** 组件实例句柄（对应 Vue `defineExpose`） */
export interface CwLoginFormHandle {
  setError: (msg: string) => void
  setPhoneError: (msg: string) => void
  setCodeError: (msg: string) => void
  setPasswordError: (msg: string) => void
}
