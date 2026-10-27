import type { HTMLAttributes } from 'react'
import type { CwLoginMethod, CwLoginFormTexts } from '@zengchaowu/ui-shared/components/CwLoginForm/types'
import type { CwLoginPanelView } from '@zengchaowu/ui-shared/components/CwLoginPanel/types'

export type { CwLoginMethod, CwLoginFormTexts }

/** PC 登录面板文案（表单 + 扫码），均由调用方传入 */
export interface CwLoginPanelTexts extends CwLoginFormTexts {
  welcome: string
  ssoLogin: string
  noAccount: string
  register: string
  wechatLoginTitle: string
  wechatLoginHint: string
  qrcodePlaceholder: string
  appleLogin: string
  wechatDisclaimer: string
  privacyAgreement: string
  phoneRegister: string
  switchQrcodeLabel: string
  switchPhoneLabel: string
  qrcodeImageAlt: string
}

export interface CwLoginPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  view?: CwLoginPanelView
  loading?: boolean
  /** 官方 WxLogin.js 挂载容器 id */
  qrcodeContainerId?: string
  /** 二维码是否已由 WxLogin 挂载完成（用于隐藏占位文案） */
  qrcodeReady?: boolean
  texts: CwLoginPanelTexts
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string } | void>
  onLogin?: (
    phone: string,
    codeOrPassword: string,
    method: CwLoginMethod,
  ) => Promise<{ success: boolean; token?: string; userInfo?: unknown; error?: string } | void>
  /** 登录方式切换（对应 Vue `update:view`） */
  onViewChange?: (view: CwLoginPanelView) => void
  onPrivacyClick?: () => void
  onForgotPasswordClick?: () => void
  onSsoClick?: () => void
  onRegisterClick?: () => void
  onAppleLoginClick?: () => void
  className?: string
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwLoginPanelEmits {
  'update:view': [value: CwLoginPanelView]
  sendCode: [phone: string]
  login: [phone: string, codeOrPassword: string, method: CwLoginMethod]
  privacyClick: []
  forgotPasswordClick: []
  ssoClick: []
  registerClick: []
  appleLoginClick: []
}
