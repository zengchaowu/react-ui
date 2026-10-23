import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwEditableEmail } from './CwEditableEmail'

const meta: Meta<typeof CwEditableEmail> = {
  title: '1. Components/Form/CwEditableEmail',
  component: CwEditableEmail,
}

export default meta
type Story = StoryObj<typeof CwEditableEmail>

function ControlledEditableEmail(
  props: ComponentProps<typeof CwEditableEmail>,
) {
  const [value, setValue] = useState<string | null>(
    props.value ?? 'user@example.com',
  )
  return (
    <CwEditableEmail
      {...props}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

export const Default: Story = {
  args: {
    value: 'user@example.com',
    placeholder: '请输入邮箱',
    align: 'left',
  },
  render: (args) => <ControlledEditableEmail {...args} />,
}

export const WithAsyncModify: Story = {
  args: {
    value: 'user@example.com',
    placeholder: '请输入邮箱',
    asyncModify: async (newValue: string | null) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return !newValue?.includes('invalid')
    },
  },
  render: (args) => <ControlledEditableEmail {...args} />,
}

export const Readonly: Story = {
  args: {
    value: 'user@example.com',
    readonly: true,
    placeholder: '请输入邮箱',
  },
}

export const Disabled: Story = {
  args: {
    value: 'user@example.com',
    disabled: true,
    placeholder: '请输入邮箱',
  },
}
