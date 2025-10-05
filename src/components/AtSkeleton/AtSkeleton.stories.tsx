import type { Meta, StoryObj } from '@storybook/react'
import { AtSkeleton } from './index'

const meta: Meta<typeof AtSkeleton> = {
  title: 'Ant Design/AtSkeleton',
  component: AtSkeleton,
  args: {
    active: true,
    paragraph: { rows: 3 },
  },
}

export default meta
export const Basic: StoryObj<typeof AtSkeleton> = {}