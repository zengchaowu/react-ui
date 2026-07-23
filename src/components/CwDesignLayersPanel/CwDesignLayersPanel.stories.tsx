import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignLayersPanel } from './CwDesignLayersPanel'

const meta: Meta<typeof CwDesignLayersPanel> = {
  title: 'Cw/CwDesignLayersPanel',
  component: CwDesignLayersPanel,
}

export default meta
type Story = StoryObj<typeof CwDesignLayersPanel>

export const Default: Story = {
  args: {
    children: 'CwDesignLayersPanel',
  },
}
