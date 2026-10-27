import type { Meta, StoryObj } from '@storybook/react'
import CwButton from '../CwButton/CwButton'
import { showTurnstileCaptchaDialog } from './showTurnstileCaptchaDialog'
import type { ShowTurnstileCaptchaDialogOptions } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'

const meta: Meta<ShowTurnstileCaptchaDialogOptions> = {
  title: '1. Components/Overlay/CwTurnstileCaptchaDialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Cloudflare Turnstile 安全验证弹窗。需传入 siteKey；成功返回 token，关闭返回 cancel。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    siteKey: '1x00000000000000000000AA',
    widgetSize: 'normal',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div className="p-4">
      <CwButton
        type="primary"
        onClick={() => {
          void showTurnstileCaptchaDialog({ ...args } as ShowTurnstileCaptchaDialogOptions)
        }}
      >
        打开 Turnstile 验证
      </CwButton>
    </div>
  ),
}
