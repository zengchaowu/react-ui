import type { HTMLAttributes, ReactNode } from 'react'
import type { CwLoginFormTexts, CwLoginMethod } from '@zengchaowu/ui-shared/components/CwLoginForm/types'

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

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwLoginFormEmits {
  sendCode: [phone: string]
  login: [phone: string, codeOrPassword: string, method: CwLoginMethod]
  privacyClick: []
  forgotPasswordClick: []
}
