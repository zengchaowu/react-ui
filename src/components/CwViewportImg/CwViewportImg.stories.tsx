import type { Meta, StoryObj } from '@storybook/react'
import { CwViewportImg } from './CwViewportImg'

const meta: Meta<typeof CwViewportImg> = {
  title: '1. Components/Display/CwViewportImg',
  component: CwViewportImg,
}

export default meta
type Story = StoryObj<typeof CwViewportImg>

export const Default: Story = {
  args: {},
}
