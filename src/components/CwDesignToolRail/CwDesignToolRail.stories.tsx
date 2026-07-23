import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignToolRail } from './CwDesignToolRail'

const meta: Meta<typeof CwDesignToolRail> = {
  title: 'Cw/CwDesignToolRail',
  component: CwDesignToolRail,
}

export default meta
type Story = StoryObj<typeof CwDesignToolRail>

export const Default: Story = {
  args: {
    children: 'CwDesignToolRail',
  },
}
