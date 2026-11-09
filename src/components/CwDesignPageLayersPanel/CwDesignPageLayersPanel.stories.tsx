import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignPageLayersPanel } from './CwDesignPageLayersPanel'

const meta: Meta<typeof CwDesignPageLayersPanel> = {
  title: '1. Components/Editor/CwDesignPageLayersPanel',
  component: CwDesignPageLayersPanel,
}

export default meta
type Story = StoryObj<typeof CwDesignPageLayersPanel>

export const Default: Story = {
  args: {},
}
