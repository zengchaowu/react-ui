import type { Meta, StoryObj } from '@storybook/react'
import { AtAnchor } from './index'

const meta: Meta<typeof AtAnchor> = {
  title: 'At/AtAnchor',
  component: AtAnchor,
  args: {
    items: [
      { key: 'part-1', href: '#part-1', title: 'At/AtAnchor', },
      { key: 'part-2', href: '#part-2', title: 'At/AtAnchor', },
      { key: 'part-3', href: '#part-3', title: 'At/AtAnchor', },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtAnchor> = {}