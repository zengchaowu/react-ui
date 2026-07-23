import type { Meta, StoryObj } from '@storybook/react'
import { CwFeatureCardGrid } from './CwFeatureCardGrid'

const meta: Meta<typeof CwFeatureCardGrid> = {
  title: 'Cw/CwFeatureCardGrid',
  component: CwFeatureCardGrid,
}

export default meta
type Story = StoryObj<typeof CwFeatureCardGrid>

export const Default: Story = {
  args: {
    children: 'CwFeatureCardGrid',
  },
}
