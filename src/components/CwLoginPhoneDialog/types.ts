import type { HTMLAttributes } from 'react'
import type { CwInputTexts } from '../CwInput/types'
import type { CwButtonTexts } from '../CwButton/types'
import type { CwCountDownButtonTexts } from '../CwCountDownButton/types'
import type { LoginMethodType } from '../CwLoginMethodSwitch/types'
import type {
  WechatPcQrcodeGenerateResult,
  WechatPcQrcodeLoginStatus,
} from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import type { TokenPair } from '@zengchaowu/shared/types/auth'

export interface CwLoginPhoneDialogStyles {
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

export interface CwLoginPhoneDialogTexts {
  /**
   * 弹窗标题
   */
  title: string
  /**
   * 微信扫码时的弹窗标题
   */
  wechatTitle: string
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
  wechatLoginTitle: string
  wechatLoginHint: string
  qrcodePlaceholder: string
  qrcodeImageAlt: string
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

export interface CwLoginPhoneDialogContentProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * 是否正在加载
   */
  loading?: boolean
  /**
   * 输入框尺寸（Sheet 场景传 large）
   */
  inputSize?: 'small' | 'medium' | 'large'
  /** dialog：居中弹窗；sheet：底部 Sheet（内容区不加水平 padding） */
  layout?: 'dialog' | 'sheet'
  texts?: Partial<CwLoginPhoneDialogTexts>
  /** 开启微信扫码登录（需同时提供 generate/poll） */
  enableWechat?: boolean
  generateWechatQrcode?: () => Promise<WechatPcQrcodeGenerateResult>
  pollWechatLogin?: (options: {
    state: string
    signal?: AbortSignal
  }) => Promise<WechatPcQrcodeLoginStatus>
  onWechatSuccess?: (pair: TokenPair) => void | Promise<void>
  /**
   * 发送验证码回调
   */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string }>
  /**
   * 登录回调
   */
  onLogin?: (
    phone: string,
    code: string,
  ) => Promise<{
    success: boolean
    userInfo?: unknown
    token?: string
    error?: string
  }>
  /**
   * 登录成功（对应 Vue `success` 事件）
   */
  onSuccess?: (data: { userInfo: unknown; token: string }) => void
  /**
   * 登录方式切换（对应 Vue `update:loginMethod` 事件）
   */
  onUpdateLoginMethod?: (method: LoginMethodType) => void
}

/** `/CwLoginPhoneDialog` 组件 props：与 Content 相同，默认 `layout="dialog"` */
export type CwLoginPhoneDialogProps = CwLoginPhoneDialogContentProps

export interface ShowLoginPhoneDialogOptions {
  texts?: Partial<CwLoginPhoneDialogTexts>
  enableWechat?: boolean
  generateWechatQrcode?: CwLoginPhoneDialogContentProps['generateWechatQrcode']
  pollWechatLogin?: CwLoginPhoneDialogContentProps['pollWechatLogin']
  onWechatSuccess?: CwLoginPhoneDialogContentProps['onWechatSuccess']
  /**
   * 发送验证码回调
   */
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string }>
  /**
   * 登录回调
   */
  onLogin?: (
    phone: string,
    code: string,
  ) => Promise<{
    success: boolean
    userInfo?: unknown
    token?: string
    error?: string
  }>
  /**
   * 成功回调
   */
  onSuccess?: (data: { userInfo: unknown; token: string }) => void
}

export interface ShowLoginPhoneDialogResult {
  /**
   * 用户信息
   */
  userInfo: unknown
  /**
   * 访问令牌
   */
  token: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwLoginPhoneDialogContentEmits {
  /**
   * 登录成功
   */
  (e: 'success', data: { userInfo: any; token: string }): void
  (e: 'update:loginMethod', method: 'phone' | 'qrcode'): void
}
