import type { Meta, StoryObj } from '@storybook/react'
import { AtSteps } from './index'

const meta: Meta<typeof AtSteps> = {
  title: 'At/AtSteps',
  component: AtSteps,
  args: {
    current: 1,
    items: [
      { title: 'At/AtSteps', },
      { title: 'At/AtSteps', },
      { title: 'At/AtSteps', },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtSteps> = {}