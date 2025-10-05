import type { Meta, StoryObj } from '@storybook/react'
import { AtCheckbox } from './index'

const meta: Meta<typeof AtCheckbox> = {
  title: 'Ant Design/AtCheckbox',
  component: AtCheckbox,
  args: {
    children: '勾选项',
    defaultChecked: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtCheckbox> = {}