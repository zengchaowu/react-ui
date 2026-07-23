import type { Meta, StoryObj } from '@storybook/react'
import { CwHashMap } from './CwHashMap'

const meta: Meta<typeof CwHashMap> = {
  title: 'Cw/CwHashMap',
  component: CwHashMap,
}

export default meta
type Story = StoryObj<typeof CwHashMap>

export const Default: Story = {
  args: {
    children: 'CwHashMap',
  },
}
