import type { Meta, StoryObj } from '@storybook/react'
import { CwQuickAnswer } from './CwQuickAnswer'

const meta: Meta<typeof CwQuickAnswer> = {
  title: '1. Components/Action/CwQuickAnswer',
  component: CwQuickAnswer,
}

export default meta
type Story = StoryObj<typeof CwQuickAnswer>

export const Default: Story = {
  args: {
    label: '肺结节',
    description: '是否已进行过胸部 CT 检查？',
    conditions: ['近一年内检查过', '检查报告可提供'],
    value: null,
  },
}
