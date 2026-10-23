import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton/CwButton'
import { CwLoginDialog } from './CwLoginDialog'
import { showLoginDialog } from './showLoginDialog'
import type { CwLoginDialogTexts } from './types'

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

const meta: Meta<typeof CwLoginDialog> = {
  title: '1. Components/Overlay/CwLoginDialog',
  component: CwLoginDialog,
  args: {
    texts: demoTexts,
    agreementLinks: [
      { id: 'user', text: '用户协议' },
      { id: 'privacy', text: '隐私政策' },
    ],
  },
}

export default meta
type Story = StoryObj<typeof CwLoginDialog>

export const Default: Story = {
  args: {
    onSendCode: async () => ({ success: true }),
    onLogin: async (phone) => ({
      success: true,
      userInfo: { phone },
      token: 'mock-token',
    }),
  },
}

export const Imperative: Story = {
  render: () => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showLoginDialog({
            texts: demoTexts,
            agreementLinks: [{ id: 'privacy', text: '隐私政策' }],
            onSendCode: async () => ({ success: true }),
            onLogin: async (phone) => ({
              success: true,
              userInfo: { phone },
              token: 'mock-token',
            }),
          })
        }}
      >
        打开登录弹窗
      </CwButton>
    </div>
  ),
}
