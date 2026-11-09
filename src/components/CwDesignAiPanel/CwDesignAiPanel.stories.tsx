import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignAiPanel } from './CwDesignAiPanel'

const meta: Meta<typeof CwDesignAiPanel> = {
  title: '1. Components/Editor/CwDesignAiPanel',
  component: CwDesignAiPanel,
}

export default meta
type Story = StoryObj<typeof CwDesignAiPanel>

export const Default: Story = {
  args: {},
}
