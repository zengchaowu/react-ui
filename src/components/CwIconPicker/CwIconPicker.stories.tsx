import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwIconPicker } from './CwIconPicker'

const meta: Meta<typeof CwIconPicker> = {
  title: '1. Components/Form/CwIconPicker',
  component: CwIconPicker,
}

export default meta
type Story = StoryObj<typeof CwIconPicker>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return <CwIconPicker {...args} value={value} onChange={setValue} />
  },
}
