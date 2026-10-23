import type { Meta, StoryObj } from '@storybook/react'
import { CwWalletPayPasswordPanel } from './CwWalletPayPasswordPanel'

const meta: Meta<typeof CwWalletPayPasswordPanel> = {
  title: '1. Components/Form/CwWalletPayPasswordPanel',
  component: CwWalletPayPasswordPanel,
}

export default meta
type Story = StoryObj<typeof CwWalletPayPasswordPanel>

export const Default: Story = {
  args: {},
}
