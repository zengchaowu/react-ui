import type { Meta, StoryObj } from '@storybook/react'
import { AtDescriptions } from './index'

const meta: Meta<typeof AtDescriptions> = {
  title: 'Ant Design/AtDescriptions',
  component: AtDescriptions,
  args: {
    title: 'User Info',
    items: [
      { key: 'name', label: 'Name', children: 'John Doe' },
      { key: 'age', label: 'Age', children: '30' },
      { key: 'address', label: 'Address', children: 'New York' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtDescriptions> = {}