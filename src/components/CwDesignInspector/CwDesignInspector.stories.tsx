import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignInspector } from './CwDesignInspector'

const meta: Meta<typeof CwDesignInspector> = {
  title: '1. Components/Layout/CwDesignInspector',
  component: CwDesignInspector,
}

export default meta
type Story = StoryObj<typeof CwDesignInspector>

export const Default: Story = {
  args: {},
}
