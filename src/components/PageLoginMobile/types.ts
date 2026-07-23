export type LoginMethod = 'sms' | 'password'

export interface PageLoginMobileProps {
  /** 是否加载中 */
  loading?: boolean
  /** 发送验证码回调，返回 { success, error? } */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string } | void>
  /** 登录回调，返回 { success, token?, userInfo?, error? } */
  onLogin?: (phone: string, codeOrPassword: string, method: LoginMethod) => Promise<{ success: boolean; token?: string; userInfo?: unknown; error?: string } | void>
  /** 自定义样式 */
  styles?: Partial<PageLoginMobileStyles>
  /** 自定义文本 */
  texts?: Partial<PageLoginMobileTexts>
}

export interface PageLoginMobileStyles {
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

export interface PageLoginMobileTexts {
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
  sendCodeError: string
  loginError: string
  loginErrorGeneral: string
}

export interface PageLoginMobileEmits {
  /** 发送验证码（当未提供 onSendCode 时由父组件处理） */
  sendCode: [phone: string]
  /** 登录（当未提供 onLogin 时由父组件处理） */
  login: [phone: string, codeOrPassword: string, method: LoginMethod]
  /** 隐私政策链接点击 */
  privacyClick: []
  /** 忘记密码点击 */
  forgotPasswordClick: []
}
