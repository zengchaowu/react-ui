import type { Meta, StoryObj } from '@storybook/react'
import { AtSpace } from './index'

const meta: Meta<typeof AtSpace> = {
  title: 'Ant Design/AtSpace',
  component: AtSpace,
  args: {
    children: ['Item 1', 'Item 2', 'Item 3'],
  },
}

export default meta
export const Basic: StoryObj<typeof AtSpace> = {}