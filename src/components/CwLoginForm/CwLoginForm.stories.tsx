import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginForm } from './CwLoginForm'
import type { CwLoginFormTexts } from '@zengchaowu/ui-shared/components/CwLoginForm/types'

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
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '手机号登录表单：支持短信/密码切换。展示文案由调用方通过 texts 传入。',
      },
    },
  },
  args: {
    loading: false,
    texts: demoTexts,
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: { type: 'boolean' }, description: '登录中状态' },
    texts: { control: false },
    onSendCode: { control: false },
    onLogin: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof CwLoginForm>

export const Default: Story = {
  args: {
    onSendCode: async () => ({ success: true }),
    onLogin: async () => ({ success: true, token: 'xxx' }),
  },
  render: (args) => {
    const [loading, setLoading] = useState(args.loading ?? false)

    useEffect(() => {
      setLoading(args.loading ?? false)
    }, [args.loading])

    async function handleSendCode(phone: string) {
      console.log('发送验证码:', phone)
      await new Promise((r) => setTimeout(r, 500))
      return { success: true }
    }

    async function handleLogin(phone: string, code: string) {
      console.log('登录:', phone, code)
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1500))
      setLoading(false)
      return { success: true, token: 'xxx', userInfo: { phone } }
    }

    return (
      <CwLoginForm
        texts={args.texts}
        loading={loading}
        onSendCode={handleSendCode}
        onLogin={handleLogin}
        onPrivacyClick={() => console.log('隐私政策点击')}
      />
    )
  },
}
