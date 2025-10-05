import type { Meta, StoryObj } from '@storybook/react'
import { AtSpin } from './index'

const meta: Meta<typeof AtSpin> = {
  title: 'Ant Design/AtSpin',
  component: AtSpin,
  args: {
    tip: 'Loading...',
    size: 'default',
  },
}

export default meta
export const Basic: StoryObj<typeof AtSpin> = {}