import type { Meta, StoryObj } from '@storybook/react'
import { AtProgress } from './index'

const meta: Meta<typeof AtProgress> = {
  title: 'Ant Design/AtProgress',
  component: AtProgress,
  args: {
    percent: 50,
    type: 'line',
  },
}

export default meta
export const Basic: StoryObj<typeof AtProgress> = {}