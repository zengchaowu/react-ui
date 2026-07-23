import type { Meta, StoryObj } from '@storybook/react'
import { CwImg } from './CwImg'

const meta: Meta<typeof CwImg> = {
  title: 'Cw/CwImg',
  component: CwImg,
}

export default meta
type Story = StoryObj<typeof CwImg>

export const Default: Story = {
  args: {
    children: 'CwImg',
  },
}
