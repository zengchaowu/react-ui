import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneDialog/texts'
import { showLoginPhoneDialog } from './showLoginPhoneDialog'

interface LoginPhoneDialogStoryArgs {
  title: string
  simulateError: boolean
}

const meta: Meta<LoginPhoneDialogStoryArgs> = {
  title: '1. Components/Overlay/CwLoginPhoneDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "手机号登录弹窗的函数式 API：showLoginPhoneDialog(options) -> Promise<{ userInfo, token } | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' }, description: '弹窗标题' },
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

function LoginPhoneDialogDemo({ args, error = false }: { args: Story['args']; error?: boolean }) {
  const showDialog = async () => {
    const callbacks = buildLoginPhoneCallbacks(Boolean(args?.simulateError))
    const result = await showLoginPhoneDialog({
      texts: { title: args?.title },
      ...callbacks,
    })
    console.log('Dialog result:', result)
  }

  return (
    <div className="p-4">
      <CwButton type="primary" onClick={showDialog}>
        {error ? '打开手机号登录弹窗（错误示例）' : '打开手机号登录弹窗'}
      </CwButton>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <LoginPhoneDialogDemo args={args} />,
}

export const WithError: Story = {
  args: {
    simulateError: true,
  },
  render: (args) => <LoginPhoneDialogDemo args={args} error />,
}
