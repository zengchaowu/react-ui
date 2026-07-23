import type { Meta, StoryObj } from '@storybook/react'
import { CwViewportImg } from './CwViewportImg'

const meta: Meta<typeof CwViewportImg> = {
  title: 'Cw/CwViewportImg',
  component: CwViewportImg,
}

export default meta
type Story = StoryObj<typeof CwViewportImg>

export const Default: Story = {
  args: {
    children: 'CwViewportImg',
  },
}
