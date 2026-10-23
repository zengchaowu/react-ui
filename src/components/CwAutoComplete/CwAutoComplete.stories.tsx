import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoComplete } from './CwAutoComplete'

const localPool = ['Apple', 'Banana', 'Orange', 'Grape', 'Watermelon']

const meta: Meta<typeof CwAutoComplete> = {
  title: '1. Components/Form/CwAutoComplete',
  component: CwAutoComplete,
}

export default meta
type Story = StoryObj<typeof CwAutoComplete>

function ControlledAutoComplete(
  props: ComponentProps<typeof CwAutoComplete>,
) {
  const [value, setValue] = useState<string | null>(null)
  return (
    <CwAutoComplete
      {...props}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

export const Default: Story = {
  args: {
    options: localPool,
    placeholder: '输入水果名',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledAutoComplete {...args} />,
}

export const RemoteMock: Story = {
  args: {
    placeholder: '远程搜索（模拟）',
    clearable: true,
    debounce: 150,
    fetchOptions: async (query: string) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return Array.from({ length: 8 }, (_, index) => `${query || 'Item'}-${index + 1}`)
    },
  },
  render: (args) => <ControlledAutoComplete {...args} />,
}

export const RightAlign: Story = {
  args: {
    options: localPool,
    placeholder: '输入水果名（右对齐）',
    align: 'right',
    clearable: true,
  },
  render: (args) => <ControlledAutoComplete {...args} />,
}
