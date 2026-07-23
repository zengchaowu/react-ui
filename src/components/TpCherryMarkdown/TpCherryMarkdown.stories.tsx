import type { Meta, StoryObj } from '@storybook/react'
import { TpCherryMarkdown } from './TpCherryMarkdown'

const meta: Meta<typeof TpCherryMarkdown> = {
  title: 'Tp/TpCherryMarkdown',
  component: TpCherryMarkdown,
}

export default meta
type Story = StoryObj<typeof TpCherryMarkdown>

export const Default: Story = {
  args: {
    children: 'TpCherryMarkdown',
  },
}
