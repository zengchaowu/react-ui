import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCenterRulerPicker } from './CwCenterRulerPicker'

const meta: Meta<typeof CwCenterRulerPicker> = {
  title: '1. Components/Form/CwCenterRulerPicker',
  component: CwCenterRulerPicker,
}

export default meta
type Story = StoryObj<typeof CwCenterRulerPicker>

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    tickWidthRem: 2.5,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? 0)
    return (
      <div style={{ width: 280 }}>
        <CwCenterRulerPicker {...args} value={value} onChange={(next) => setValue(next)} />
      </div>
    )
  },
}
