import type { Meta, StoryObj } from '@storybook/react'
import { CwUnionFind } from './CwUnionFind'

const meta: Meta<typeof CwUnionFind> = {
  title: 'Cw/CwUnionFind',
  component: CwUnionFind,
}

export default meta
type Story = StoryObj<typeof CwUnionFind>

export const Default: Story = {
  args: {
    children: 'CwUnionFind',
  },
}
