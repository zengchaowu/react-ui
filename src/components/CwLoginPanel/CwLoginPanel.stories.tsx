import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginPanel } from './CwLoginPanel'
import type { CwLoginMethod, CwLoginPanelTexts } from './types'
import type { CwLoginPanelView } from '@zengchaowu/ui-shared/components/CwLoginPanel/types'

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
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'PC 登录卡片：支持表单登录（短信/密码）与微信扫码切换。展示文案由调用方通过 texts 传入。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: { type: 'select' },
      options: ['form', 'qrcode'],
    },
    loading: { control: { type: 'boolean' } },
    qrcodeReady: { control: { type: 'boolean' }, description: '二维码是否已挂载（隐藏占位）' },
    texts: { control: false },
    onSendCode: { control: false },
    onLogin: { control: false },
  },
  args: {
    view: 'form',
    loading: false,
    qrcodeReady: false,
    texts: demoTexts,
  },
}

export default meta
type Story = StoryObj<typeof CwLoginPanel>

function useLoginPanelHandlers() {
  return {
    onSendCode: async (phone: string) => {
      console.log('发送验证码:', phone)
      await new Promise((r) => setTimeout(r, 500))
      return { success: true }
    },
    onLogin: async (phone: string, payload: string, method: CwLoginMethod) => {
      console.log('登录:', phone, payload, method)
      await new Promise((r) => setTimeout(r, 1000))
      return { success: true, token: 'xxx', userInfo: { phone } }
    },
    onPrivacyClick: () => console.log('隐私政策'),
    onForgotPasswordClick: () => console.log('忘记密码'),
    onSsoClick: () => console.log('SSO'),
    onRegisterClick: () => console.log('注册'),
    onAppleLoginClick: () => console.log('Apple 登录'),
  }
}

export const Default: Story = {
  args: {
    onSendCode: async () => ({ success: true }),
    onLogin: async () => ({ success: true, token: 'xxx' }),
  },
  render: (args) => {
    const [view, setView] = useState<CwLoginPanelView>(args.view ?? 'form')

    useEffect(() => {
      if (args.view) setView(args.view)
    }, [args.view])

    return (
      <CwLoginPanel
        view={view}
        loading={args.loading}
        qrcodeReady={args.qrcodeReady}
        texts={args.texts}
        onViewChange={setView}
        {...useLoginPanelHandlers()}
      />
    )
  },
}

export const QrcodeView: Story = {
  args: {
    view: 'qrcode',
    qrcodeContainerId: 'storybook-wechat-wx-login',
  },
  render: (args) => {
    const [view, setView] = useState<CwLoginPanelView>(args.view ?? 'qrcode')

    useEffect(() => {
      if (args.view) setView(args.view)
    }, [args.view])

    return (
      <CwLoginPanel
        view={view}
        loading={args.loading}
        qrcodeReady={args.qrcodeReady}
        texts={args.texts}
        qrcodeContainerId="storybook-wechat-wx-login"
        onViewChange={setView}
      />
    )
  },
}
