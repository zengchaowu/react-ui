import type { Meta, StoryObj } from '@storybook/react'
import { CwFormItem } from './CwFormItem'

const meta: Meta<typeof CwFormItem> = {
  title: 'Cw/CwFormItem',
  component: CwFormItem,
}

export default meta
type Story = StoryObj<typeof CwFormItem>

export const Default: Story = {
  args: {
    children: 'CwFormItem',
  },
}
