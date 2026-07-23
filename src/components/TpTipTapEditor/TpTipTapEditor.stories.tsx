import type { Meta, StoryObj } from '@storybook/react'
import { TpTipTapEditor } from './TpTipTapEditor'

const meta: Meta<typeof TpTipTapEditor> = {
  title: 'Tp/TpTipTapEditor',
  component: TpTipTapEditor,
}

export default meta
type Story = StoryObj<typeof TpTipTapEditor>

export const Default: Story = {
  args: {
    children: 'TpTipTapEditor',
  },
}
