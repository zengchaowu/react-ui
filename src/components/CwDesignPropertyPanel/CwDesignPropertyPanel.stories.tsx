import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignPropertyPanel } from './CwDesignPropertyPanel'

const meta: Meta<typeof CwDesignPropertyPanel> = {
  title: '1. Components/Editor/CwDesignPropertyPanel',
  component: CwDesignPropertyPanel,
}

export default meta
type Story = StoryObj<typeof CwDesignPropertyPanel>

export const Default: Story = {
  args: {},
}
