import type { Meta, StoryObj } from '@storybook/react'
import { CwStack } from './CwStack'

const meta: Meta<typeof CwStack> = {
  title: 'Cw/CwStack',
  component: CwStack,
}

export default meta
type Story = StoryObj<typeof CwStack>

export const Default: Story = {
  args: {
    children: 'CwStack',
  },
}
