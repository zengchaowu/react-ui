import type { Meta, StoryObj } from '@storybook/react'
import { AtCheckbox } from './index'

const meta: Meta<typeof AtCheckbox> = {
  title: 'At/AtCheckbox',
  component: AtCheckbox,
  args: {
    children: '勾选项',
    defaultChecked: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtCheckbox> = {}