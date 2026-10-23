import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCountDownButton } from './CwCountDownButton'

const meta: Meta<typeof CwCountDownButton> = {
  title: '1. Components/Action/CwCountDownButton',
  component: CwCountDownButton,
  args: {
    duration: 30,
    interval: 1,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ControlledCountDownButton() {
  const [active, setActive] = useState(false)

  return (
    <CwCountDownButton
      value={active}
      onChange={setActive}
      duration={10}
      beforeStart={() => new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 600)
      })}
    />
  )
}

export const Default: Story = {
  render: () => <ControlledCountDownButton />,
}

export const CustomSlot: Story = {
  args: {
    duration: 20,
  },
  render: (args) => (
    <CwCountDownButton {...args}>
      {({ status, remaining }) => {
        if (status === 'idle') return <span>获取验证码</span>
        if (status === 'pending') return <span>请求中...</span>
        if (status === 'counting') return <span>{remaining} 秒后可再次获取</span>
        return <span>再次获取</span>
      }}
    </CwCountDownButton>
  ),
}
