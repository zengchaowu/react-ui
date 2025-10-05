import type { Meta, StoryObj } from '@storybook/react'
import { AtSteps } from './index'

const meta: Meta<typeof AtSteps> = {
  title: 'Ant Design/AtSteps',
  component: AtSteps,
  args: {
    current: 1,
    items: [
      { title: 'Step 1' },
      { title: 'Step 2' },
      { title: 'Step 3' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtSteps> = {}