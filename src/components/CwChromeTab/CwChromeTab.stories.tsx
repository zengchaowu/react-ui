import type { Meta, StoryObj } from '@storybook/react'
import { CwChromeTab } from './CwChromeTab'

const meta: Meta<typeof CwChromeTab> = {
  title: 'Cw/CwChromeTab',
  component: CwChromeTab,
}

export default meta
type Story = StoryObj<typeof CwChromeTab>

export const Default: Story = {
  args: {
    children: 'CwChromeTab',
  },
}
