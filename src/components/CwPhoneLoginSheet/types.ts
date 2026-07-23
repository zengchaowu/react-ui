import type { CwPhoneLoginDialogStyles, CwPhoneLoginDialogTexts } from '../CwPhoneLoginDialog/types'

export type CwPhoneLoginSheetStyles = CwPhoneLoginDialogStyles
export type CwPhoneLoginSheetTexts = CwPhoneLoginDialogTexts

export interface ShowPhoneLoginSheetOptions {
  /**
   * 自定义样式
   */
  styles?: Partial<CwPhoneLoginSheetStyles>
  /**
   * 自定义文本
   */
  texts?: Partial<CwPhoneLoginSheetTexts>
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

export interface ShowPhoneLoginSheetResult {
  /**
   * 用户信息
   */
  userInfo: any
  /**
   * 访问令牌
   */
  token: string
}

