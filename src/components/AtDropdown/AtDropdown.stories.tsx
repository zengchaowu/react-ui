import type { Meta, StoryObj } from '@storybook/react'
import { AtDropdown } from './index'

const meta: Meta<typeof AtDropdown> = {
  title: 'At/AtDropdown',
  component: AtDropdown,
  args: {
    menu: {
      items: [
        { key: '1', label: 'Item 1' },
        { key: '2', label: 'Item 2' },
        { key: '3', label: 'Item 3' },
      ],
    },
    children: 'Hover me',
  },
}

export default meta
export const Basic: StoryObj<typeof AtDropdown> = {}