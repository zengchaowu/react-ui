import type { CwInputTexts } from '../CwInput/types'
import type { CwButtonTexts } from '../CwButton/types'
import type { CwCountDownButtonTexts } from '../CwCountDownButton/types'


export interface CwPhoneLoginDialogStyles {
  /**
   * 内容区域样式
   */
  content: string
  /**
   * 输入组样式
   */
  inputGroup: string
  /**
   * 错误消息样式
   */
  errorMessage: string
  /**
   * 全局错误样式
   */
  globalError: string
  /**
   * 按钮组容器样式
   */
  buttonGroup: string
  /**
   * 登录按钮样式
   */
  loginButton: string
  /**
   * Input 组件样式
   */
}

export interface CwPhoneLoginDialogTexts {
  /**
   * 弹窗标题
   */
  title: string
  /**
   * 手机号标签
   */
  phoneLabel: string
  /**
   * 手机号占位符
   */
  phonePlaceholder: string
  /**
   * 验证码标签
   */
  codeLabel: string
  /**
   * 验证码占位符
   */
  codePlaceholder: string
  /**
   * 发送验证码按钮文本
   */
  sendCodeButton: string
  /**
   * 倒计时文本模板（{seconds} 会被替换为秒数）
   */
  countdownText: string
  /**
   * 登录按钮文本
   */
  loginButton: string
  /**
   * 登录中文本
   */
  loggingIn: string
  /**
   * 发送验证码错误提示
   */
  sendCodeError: string
  /**
   * 登录错误提示
   */
  loginError: string
  /**
   * 登录通用错误提示
   */
  loginErrorGeneral: string
  /**
   * Input 组件文本
   */
  inputTexts?: Partial<CwInputTexts>
  /**
   * Button 组件文本
   */
  buttonTexts?: Partial<CwButtonTexts>
  /**
   * CountDownButton 组件文本
   */
  countDownButtonTexts?: Partial<CwCountDownButtonTexts>
}

export interface CwPhoneLoginDialogContentProps {
  /**
   * 是否正在加载
   */
  loading?: boolean
  /**
   * 输入框尺寸（Sheet 场景传 large）
   */
  inputSize?: 'small' | 'medium' | 'large'
  /**
   * 自定义样式
   */
  styles?: Partial<CwPhoneLoginDialogStyles>
  /**
   * 自定义文本
   */
  texts?: Partial<CwPhoneLoginDialogTexts>
  /**
   * 发送验证码回调
   */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string }>
  /**
   * 登录回调
   */
  onLogin?: (phone: string, code: string) => Promise<{ success: boolean; userInfo?: any; token?: string; error?: string }>
}

export interface CwPhoneLoginDialogContentEmits {
  /**
   * 登录成功
   */
  (e: 'success', data: { userInfo: any; token: string }): void
}

export interface ShowPhoneLoginDialogOptions {
  /**
   * 自定义样式
   */
  styles?: Partial<CwPhoneLoginDialogStyles>
  /**
   * 自定义文本
   */
  texts?: Partial<CwPhoneLoginDialogTexts>
  /**
   * 发送验证码回调
   */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string }>
  /**
   * 登录回调
   */
  onLogin?: (phone: string, code: string) => Promise<{ success: boolean; userInfo?: any; token?: string; error?: string }>
  /**
   * 成功回调
   */
  onSuccess?: (data: { userInfo: any; token: string }) => void
}

export interface ShowPhoneLoginDialogResult {
  /**
   * 用户信息
   */
  userInfo: any
  /**
   * 访问令牌
   */
  token: string
}

