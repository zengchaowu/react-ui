import type { Meta, StoryObj } from '@storybook/react'
import { CwCornerClosableWrap } from './CwCornerClosableWrap'

const meta: Meta<typeof CwCornerClosableWrap> = {
  title: '1. Components/Display/CwCornerClosableWrap',
  component: CwCornerClosableWrap,
}

export default meta
type Story = StoryObj<typeof CwCornerClosableWrap>

export const Default: Story = {
  args: {},
}
