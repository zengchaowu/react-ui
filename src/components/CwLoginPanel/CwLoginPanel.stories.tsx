import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginPanel } from './CwLoginPanel'
import type { CwLoginPanelTexts } from './types'

const demoTexts: CwLoginPanelTexts = {
  welcome: '欢迎使用 Boardmix',
  segmentSms: '短信登录',
  segmentPassword: '密码登录',
  phonePlaceholder: '请输入手机号',
  phoneOrEmailPlaceholder: '请输入手机号码或邮箱',
  codePlaceholder: '验证码',
  passwordPlaceholder: '请输入密码',
  sendCodeButton: '发送',
  loginButton: '登录',
  loggingIn: '登录中...',
  privacyPrefix: '阅读并同意',
  privacyLink: '隐私政策',
  forgotPassword: '忘记密码',
  showPasswordLabel: '显示',
  hidePasswordLabel: '隐藏',
  sendCodeError: '发送失败，请稍后重试',
  loginError: '登录失败，请检查验证码',
  loginErrorGeneral: '登录失败，请稍后重试',
  ssoLogin: '使用 SSO 登录',
  noAccount: '还没有账号? ',
  register: '注册',
  wechatLoginTitle: '微信扫码一键登录',
  wechatLoginHint: '扫码后关注公众号即可完成注册登录',
  qrcodePlaceholder: '二维码占位',
  appleLogin: 'Apple 登录',
  wechatDisclaimer: '未注册的微信号将自动创建 Boardmix 账号，注册登录',
  privacyAgreement: '即代表同意',
  phoneRegister: '手机号/邮箱注册',
  switchQrcodeLabel: '微信扫码登录',
  switchPhoneLabel: '其他登录方式',
  qrcodeImageAlt: '微信扫码登录',
}

const meta: Meta<typeof CwLoginPanel> = {
  title: '1. Components/Form/CwLoginPanel',
  component: CwLoginPanel,
  args: {
    view: 'form',
    loading: false,
    qrcodeReady: false,
    texts: demoTexts,
  },
}

export default meta
type Story = StoryObj<typeof CwLoginPanel>

export const Default: Story = {
  args: {
    onSendCode: async () => ({ success: true }),
    onLogin: async () => ({ success: true, token: 'xxx' }),
  },
}

export const QrcodeView: Story = {
  args: {
    view: 'qrcode',
    qrcodeContainerId: 'storybook-wechat-wx-login',
  },
}
