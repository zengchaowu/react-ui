import type { Meta, StoryObj } from '@storybook/react'
import { AtStatistic } from './index'

const meta: Meta<typeof AtStatistic> = {
  title: 'At/AtStatistic',
  component: AtStatistic,
  args: {
    title: 'At/AtStatistic',
    value: 112893,
  },
}

export default meta
export const Basic: StoryObj<typeof AtStatistic> = {}