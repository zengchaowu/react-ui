import type { HTMLAttributes } from 'react'

import type { LoginMethodType } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/types'
import type {
  WechatPcQrcodeGenerateResult,
  WechatPcQrcodeLoginStatus,
} from '@zengchaowu/shared/functions/wechat/openPlatform/resolveWechatPcQrcodeLoginSession'
import type { TokenPair } from '@zengchaowu/shared/types/auth'
import type { CwLoginPhoneDialogTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneDialog/types'

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
