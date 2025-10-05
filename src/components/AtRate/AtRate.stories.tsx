import type { Meta, StoryObj } from '@storybook/react'
import { AtRate } from './index'

const meta: Meta<typeof AtRate> = {
  title: 'Ant Design/AtRate',
  component: AtRate,
  args: {
    defaultValue: 3,
  },
}

export default meta
export const Basic: StoryObj<typeof AtRate> = {}