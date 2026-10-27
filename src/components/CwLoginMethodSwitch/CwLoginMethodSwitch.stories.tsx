import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginMethodSwitch } from './CwLoginMethodSwitch'
import type { LoginMethodType } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/types'

const meta: Meta<typeof CwLoginMethodSwitch> = {
  title: '1. Components/Form/CwLoginMethodSwitch',
  component: CwLoginMethodSwitch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '登录方式切换组件：左侧 badge 文本，右侧三角形裁剪区内置图标。点击切换二维码/手机图标。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'select' },
      options: ['qrcode', 'phone']
    }
  }
}

export default meta
type Story = StoryObj<typeof CwLoginMethodSwitch>

export const Default: Story = {
  args: {
    value: 'qrcode',
  },
  render: (args) => {
    const [value, setValue] = useState<LoginMethodType>(args.value ?? 'qrcode')

    useEffect(() => {
      if (args.value) setValue(args.value)
    }, [args.value])

    return (
      <div className="w-80">
        <CwLoginMethodSwitch
          {...args}
          value={value}
          onChange={(next) => {
            console.log('change', next)
            setValue(next)
          }}
        />
      </div>
    )
  },
}
