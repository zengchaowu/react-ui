import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignToolRail } from './CwDesignToolRail'

const meta: Meta<typeof CwDesignToolRail> = {
  title: '1. Components/Layout/CwDesignToolRail',
  component: CwDesignToolRail,
}

export default meta
type Story = StoryObj<typeof CwDesignToolRail>

export const Default: Story = {
  args: {},
}
