import type { Meta, StoryObj } from '@storybook/react'
import { AtSpace } from './index'

const meta: Meta<typeof AtSpace> = {
  title: 'At/AtSpace',
  component: AtSpace,
  args: {
    children: ['Item 1', 'Item 2', 'Item 3'],
  },
}

export default meta
export const Basic: StoryObj<typeof AtSpace> = {}