import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignViewportToolbar } from './CwDesignViewportToolbar'

const meta: Meta<typeof CwDesignViewportToolbar> = {
  title: '1. Components/Editor/CwDesignViewportToolbar',
  component: CwDesignViewportToolbar,
}

export default meta
type Story = StoryObj<typeof CwDesignViewportToolbar>

export const Default: Story = {
  args: {},
}
