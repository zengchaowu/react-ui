import type { Meta, StoryObj } from '@storybook/react'
import { CwMarkdown } from './CwMarkdown'

const meta: Meta<typeof CwMarkdown> = {
  title: 'Cw/CwMarkdown',
  component: CwMarkdown,
}

export default meta
type Story = StoryObj<typeof CwMarkdown>

export const Default: Story = {
  args: {
    children: 'CwMarkdown',
  },
}
