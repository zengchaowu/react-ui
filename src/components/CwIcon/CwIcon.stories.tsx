import type { Meta, StoryObj } from '@storybook/react'
import { CwIcon } from './CwIcon'

const meta: Meta<typeof CwIcon> = {
  title: 'Cw/CwIcon',
  component: CwIcon,
}

export default meta
type Story = StoryObj<typeof CwIcon>

export const Font: Story = {
  args: {
    name: 'common--nav--folder',
    size: 1.5,
  },
}

export const Spin: Story = {
  args: {
    name: 'common--nav--folder',
    size: 1.5,
    spin: true,
  },
}
