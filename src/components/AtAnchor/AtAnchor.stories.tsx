import type { Meta, StoryObj } from '@storybook/react'
import { AtAnchor } from './index'

const meta: Meta<typeof AtAnchor> = {
  title: 'Ant Design/AtAnchor',
  component: AtAnchor,
  args: {
    items: [
      { key: 'part-1', href: '#part-1', title: 'Part 1' },
      { key: 'part-2', href: '#part-2', title: 'Part 2' },
      { key: 'part-3', href: '#part-3', title: 'Part 3' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtAnchor> = {}