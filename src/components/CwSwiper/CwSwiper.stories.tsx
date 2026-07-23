import type { Meta, StoryObj } from '@storybook/react'
import { CwSwiper } from './CwSwiper'

const meta: Meta<typeof CwSwiper> = {
  title: 'Cw/CwSwiper',
  component: CwSwiper,
}

export default meta
type Story = StoryObj<typeof CwSwiper>

export const Default: Story = {
  args: {
    children: 'CwSwiper',
  },
}
