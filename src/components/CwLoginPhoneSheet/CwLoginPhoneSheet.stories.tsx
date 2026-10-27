import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneDialog/texts'
import { showLoginPhoneSheet } from './showLoginPhoneSheet'

interface LoginPhoneSheetStoryArgs {
  title: string
  simulateError: boolean
}

const meta: Meta<LoginPhoneSheetStoryArgs> = {
  title: '1. Components/Overlay/CwLoginPhoneSheet',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "手机号登录 Sheet（底部弹出）的函数式 API：showLoginPhoneSheet(options) -> Promise<{ userInfo, token } | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' }, description: 'Sheet 标题' },
    simulateError: { control: { type: 'boolean' }, description: '模拟发送/登录失败' },
  },
  args: {
    title: defaultTexts.title,
    simulateError: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function buildLoginPhoneCallbacks(simulateError: boolean) {
  return {
    onSendCode: async (phone: string) => {
      console.log('发送验证码:', phone)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (simulateError) {
        return { success: false, error: '发送验证码失败，请稍后重试' }
      }
      return { success: true, error: undefined }
    },
    onLogin: async (phone: string, code: string) => {
      console.log('登录:', phone, code)
      await new Promise((resolve) => setTimeout(resolve, simulateError ? 1000 : 2000))
      if (simulateError) {
        return { success: false, error: '验证码错误，请重新输入' }
      }
      return {
        success: true,
        userInfo: { id: '1', phone, name: '测试用户' },
        token: 'mock-token-12345',
        error: undefined,
      }
    },
    onSuccess: (data: { userInfo: unknown; token: string }) => {
      console.log('登录成功:', data)
    },
  }
}

function LoginPhoneSheetDemo({ args, error = false }: { args: Story['args']; error?: boolean }) {
  const showSheet = async () => {
    const callbacks = buildLoginPhoneCallbacks(Boolean(args?.simulateError))
    const result = await showLoginPhoneSheet({
      texts: { title: args?.title },
      ...callbacks,
    })
    console.log('Sheet result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showSheet}>
        {error ? '打开手机号登录 Sheet（错误示例）' : '打开手机号登录 Sheet'}
      </CwButton>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <LoginPhoneSheetDemo args={args} />,
}

export const WithError: Story = {
  args: {
    simulateError: true,
  },
  render: (args) => <LoginPhoneSheetDemo args={args} error />,
}
