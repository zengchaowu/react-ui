import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton/CwButton'
import { showLoginDialog } from './showLoginDialog'
import type { CwLoginDialogTexts, CwLoginDialogThirdPartyLink, ShowLoginDialogOptions } from './types'
import type { CwLoginDialogAgreementLink } from '@zengchaowu/ui-shared/components/CwLoginDialog/types'

const demoAgreementLinks: CwLoginDialogAgreementLink[] = [
  { id: 'user', text: '用户协议' },
  { id: 'privacy', text: '隐私政策' },
  { id: 'terms', text: '账号服务须知' },
]

const demoThirdPartyLinks: CwLoginDialogThirdPartyLink[] = [
  { id: 'douyin', label: '抖音一键登录' },
  { id: 'feishu', label: '飞书企业账号登录' },
]

const demoTexts: CwLoginDialogTexts = {
  title: '登录以解锁更多功能',
  navTitle: '登录',
  phonePlaceholder: '请输入手机号',
  nextStep: '下一步',
  nextStepLoading: '发送中...',
  agreementPrefix: '已阅读并同意',
  agreementRequiredError: '请先阅读并同意相关协议',
  qrInstruction: '使用微信扫码或快捷登录',
  qrPlaceholder: '正在加载二维码…',
  otpNavTitle: '输入 6 位验证码',
  backLabel: '返回',
  otpMainTitle: '输入 6 位验证码',
  otpSentHint: '验证码已发送至 +{dialCode} {phone}',
  sendCodeButton: '重新发送',
  countdownText: '{seconds}秒',
  otpVerifyLoading: '验证中...',
  otpHelpLabel: '帮助',
  switchToQrLabel: '切换微信扫码登录',
  switchToPhoneLabel: '切换手机号登录',
  sendCodeError: '发送失败，请稍后重试',
  loginError: '验证码错误，请重新输入',
  loginErrorGeneral: '登录失败，请稍后重试',
}

interface LoginDialogStoryArgs {
  title: string
  navTitle: string
  enableWechat: boolean
}

const meta: Meta<LoginDialogStoryArgs> = {
  title: '1. Components/Overlay/CwLoginDialog',
  argTypes: {
    title: { control: { type: 'text' }, description: '弹窗主标题（texts.title）' },
    navTitle: { control: { type: 'text' }, description: '导航标题（texts.navTitle）' },
    enableWechat: { control: { type: 'boolean' }, description: '是否启用微信扫码栏' },
  },
  args: {
    title: demoTexts.title,
    navTitle: demoTexts.navTitle,
    enableWechat: true,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '登录：宽屏居中弹窗（手机号 + 微信扫码双栏）；窄屏 / 移动端只走手机号，不接微信扫码。站内已挂 CwStack 时应走 presentLoginDialog push 子页。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: LoginDialogStoryArgs = {
  title: demoTexts.title,
  navTitle: demoTexts.navTitle ?? '登录',
  enableWechat: true,
}

function buildLoginDialogOptions(args: LoginDialogStoryArgs): ShowLoginDialogOptions {
  const texts: CwLoginDialogTexts = {
    ...demoTexts,
    title: args.title,
    navTitle: args.navTitle,
  }
  return {
    texts,
    agreementLinks: demoAgreementLinks,
    ...(args.enableWechat
      ? {
          thirdPartyLinks: demoThirdPartyLinks,
          generateWechatQrcode: async () => {
            await new Promise((r) => setTimeout(r, 400))
            return {
              mode: 'open_platform' as const,
              state: 'demo-state',
              appId: 'wx-demo-appid',
              redirectUri: 'https://example.com/wechat/callback',
              scope: 'snsapi_login',
            }
          },
          pollWechatLogin: async () => {
            await new Promise((r) => setTimeout(r, 8000))
            return { status: 'expired' as const }
          },
          onWechatSuccess: async (pair: unknown) => {
            console.log('微信登录成功', pair)
          },
        }
      : {}),
    onSendCode: async (phone: string, dialCode: string) => {
      console.log('发送验证码:', dialCode, phone)
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { success: true }
    },
    onLogin: async (phone: string, code: string, dialCode: string) => {
      console.log('登录:', dialCode, phone, code)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return {
        success: true,
        userInfo: { id: '1', phone, name: '演示用户' },
        token: 'mock-token-unlock',
      }
    },
    onAgreementLink: (id: string) => {
      console.log('协议链接:', id)
    },
    onThirdPartyLogin: (id: string) => {
      console.log('第三方登录:', id)
    },
    onOtpHelp: () => {
      console.log('验证码帮助')
    },
    onSuccess: (data: unknown) => {
      console.log('登录成功', data)
    },
  }
}

export const Default: Story = {
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showLoginDialog(
            buildLoginDialogOptions({ ...defaultArgs, ...args }),
          ).then((result) => {
            console.log('解锁登录弹窗结果:', result)
          })
        }}
      >
        打开登录弹窗（含微信扫码）
      </CwButton>
    </div>
  ),
}

export const PhoneOnly: Story = {
  render: () => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showLoginDialog({
            texts: demoTexts,
            agreementLinks: demoAgreementLinks,
            onSendCode: async () => {
              await new Promise((r) => setTimeout(r, 400))
              return { success: true }
            },
            onLogin: async (phone) => {
              await new Promise((r) => setTimeout(r, 600))
              return {
                success: true,
                userInfo: { id: '1', phone },
                token: 'token',
              }
            },
          })
        }}
      >
        仅手机号登录
      </CwButton>
    </div>
  ),
}

