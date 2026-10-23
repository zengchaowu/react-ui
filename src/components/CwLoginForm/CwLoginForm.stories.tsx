import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginForm } from './CwLoginForm'
import type { CwLoginFormTexts } from './types'

const demoTexts: CwLoginFormTexts = {
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
}

const meta: Meta<typeof CwLoginForm> = {
  title: '1. Components/Form/CwLoginForm',
  component: CwLoginForm,
  args: {
    loading: false,
    texts: demoTexts,
  },
}

export default meta
type Story = StoryObj<typeof CwLoginForm>

export const Default: Story = {
  args: {
    onSendCode: async () => ({ success: true }),
    onLogin: async () => ({ success: true, token: 'xxx' }),
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}
