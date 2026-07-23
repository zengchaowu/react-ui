import type { Meta, StoryObj } from '@storybook/react'
import { TpCodePreview } from './TpCodePreview'

const meta: Meta<typeof TpCodePreview> = {
  title: 'Tp/TpCodePreview',
  component: TpCodePreview,
}

export default meta
type Story = StoryObj<typeof TpCodePreview>

export const Default: Story = {
  args: {
    children: 'TpCodePreview',
  },
}
