import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoCompleteEmail } from './CwAutoCompleteEmail'

const meta: Meta<typeof CwAutoCompleteEmail> = {
  title: '1. Components/Form/CwAutoCompleteEmail',
  component: CwAutoCompleteEmail,
}

export default meta
type Story = StoryObj<typeof CwAutoCompleteEmail>

function ControlledEmail(
  props: ComponentProps<typeof CwAutoCompleteEmail>,
) {
  const [value, setValue] = useState<string | null>(null)
  return (
    <CwAutoCompleteEmail
      {...props}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

export const Default: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledEmail {...args} />,
}

export const WithInitialValue: Story = {
  args: {
    value: 'example@gmail.com',
    placeholder: '请输入邮箱地址',
    clearable: true,
  },
}

export const CustomSuffixes: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    clearable: true,
    emailSuffixes: ['@example.com', '@test.com', '@demo.com'],
  },
  render: (args) => <ControlledEmail {...args} />,
}
