import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { CwSliderProps } from './types'
import { CwSlider } from './CwSlider'

const meta: Meta<typeof CwSlider> = {
  title: '1. Components/Form/CwSlider',
  component: CwSlider,
}

export default meta
type Story = StoryObj<typeof meta>

function ControlledSlider(props: CwSliderProps) {
  const [value, setValue] = useState(props.value ?? 30)
  return <CwSlider {...props} value={value} onChange={setValue} />
}

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => <ControlledSlider {...args} />,
}

export const Readonly: Story = {
  args: {
    min: 0,
    max: 100,
    step: 5,
    readonly: true,
    value: 50,
  },
}

export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    step: 10,
    disabled: true,
    value: 70,
  },
}
