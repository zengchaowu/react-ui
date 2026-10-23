import type { CwLoginPhoneDialogTexts } from './types'

export const defaultTexts: CwLoginPhoneDialogTexts = {
  title: '手机号登录',
  wechatTitle: '微信扫码登录',
  phoneLabel: '手机号',
  phonePlaceholder: '请输入手机号',
  codeLabel: '验证码',
  codePlaceholder: '请输入验证码',
  sendCodeButton: '发送验证码',
  countdownText: '{seconds}秒后重发',
  loginButton: '登录',
  loggingIn: '登录中...',
  sendCodeError: '发送失败，请稍后重试',
  loginError: '登录失败，请检查验证码',
  loginErrorGeneral: '登录失败，请稍后重试',
  wechatLoginTitle: '微信扫码登录',
  wechatLoginHint: '请使用微信扫描二维码登录',
  qrcodePlaceholder: '二维码加载中…',
  qrcodeImageAlt: '微信登录二维码',
}
