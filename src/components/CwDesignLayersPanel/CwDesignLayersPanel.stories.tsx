import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignLayersPanel } from './CwDesignLayersPanel'

const meta: Meta<typeof CwDesignLayersPanel> = {
  title: '1. Components/Layout/CwDesignLayersPanel',
  component: CwDesignLayersPanel,
}

export default meta
type Story = StoryObj<typeof CwDesignLayersPanel>

export const Default: Story = {
  args: {},
}
