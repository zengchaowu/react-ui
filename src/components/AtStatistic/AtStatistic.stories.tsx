import type { Meta, StoryObj } from '@storybook/react'
import { AtStatistic } from './index'

const meta: Meta<typeof AtStatistic> = {
  title: 'Ant Design/AtStatistic',
  component: AtStatistic,
  args: {
    title: 'Active Users',
    value: 112893,
  },
}

export default meta
export const Basic: StoryObj<typeof AtStatistic> = {}