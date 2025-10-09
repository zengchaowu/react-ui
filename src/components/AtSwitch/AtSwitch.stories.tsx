import type { Meta, StoryObj } from '@storybook/react'
import { AtSwitch } from './index'

const meta: Meta<typeof AtSwitch> = {
  title: 'At/AtSwitch',
  component: AtSwitch,
  args: {
    defaultChecked: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtSwitch> = {}