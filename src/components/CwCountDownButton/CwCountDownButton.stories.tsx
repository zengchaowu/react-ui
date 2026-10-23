import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwCountDownButton } from './CwCountDownButton'

const meta: Meta<typeof CwCountDownButton> = {
  title: '1. Components/Action/CwCountDownButton',
  component: CwCountDownButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '倒计时按钮：透传 CwButton 的 type / variant / size / shape / appearance；全宽用 block 或外层 class。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number' },
    },
    interval: {
      control: { type: 'number' },
    },
    autoStart: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '按钮尺寸',
    },
    appearance: {
      control: { type: 'select' },
      options: [
        'default',
        'icon',
        'chrome',
        'avatar',
        'backdrop',
        'tile',
        'desktop-icon',
        'dock',
        'list-item',
        'preset',
        'on-media',
        'on-media-text',
        'overlay-icon',
      ],
      description: '透传 CwButton 官方外观',
    },
    block: {
      control: { type: 'boolean' },
      description: '是否拉满可用宽度',
    },
  },
  args: {
    duration: 30,
    interval: 1,
  },
}

export default meta
type Story = StoryObj<typeof CwCountDownButton>

function DefaultDemo() {
  const [active, setActive] = useState(false)
  const handleBeforeStart = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return true
  }
  return (
    <div className="flex w-64 flex-col gap-4">
      <CwCountDownButton
        value={active}
        onChange={setActive}
        duration={30}
        interval={1}
        beforeStart={handleBeforeStart}
      />
    </div>
  )
}

export const Default: Story = {
  args: {
    duration: 30,
    interval: 1,
  },
  render: () => <DefaultDemo />,
}

function RetryOnFailureDemo() {
  const [active, setActive] = useState(false)
  const [failureCount, setFailureCount] = useState(0)
  const handleBeforeStart = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (failureCount < 1) {
      setFailureCount((prev) => prev + 1)
      return false
    }
    setFailureCount(0)
    return true
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <CwCountDownButton
        value={active}
        onChange={setActive}
        duration={15}
        interval={1}
        beforeStart={handleBeforeStart}
      />
      <div className="text-sm text-[var(--text-color-secondary)]">
        第一次点击会失败用于演示，当前失败次数：{failureCount}
      </div>
    </div>
  )
}

export const RetryOnFailure: Story = {
  args: {
    duration: 15,
    interval: 1,
  },
  render: () => <RetryOnFailureDemo />,
}

function WithSlotsDemo() {
  const [active, setActive] = useState(false)
  const handleBeforeStart = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  }
  return (
    <SlotStorySection slot="default">
      <CwCountDownButton
        value={active}
        onChange={setActive}
        duration={20}
        interval={1}
        beforeStart={handleBeforeStart}
      >
        {({ status, remaining }) => {
          if (status === 'idle') return <span>获取验证码</span>
          if (status === 'pending') return <span>请求中...</span>
          if (status === 'counting') return <span>{remaining} 秒后可再次获取</span>
          return <span>再次获取</span>
        }}
      </CwCountDownButton>
    </SlotStorySection>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    duration: 20,
    interval: 1,
  },
  render: () => <WithSlotsDemo />,
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo() {
  const [active, setActive] = useState({ small: false, medium: false, large: false })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((item) => (
          <CwCountDownButton
            key={item.value}
            value={active[item.value]}
            onChange={(next) =>
              setActive((prev) => ({ ...prev, [item.value]: next }))
            }
            type="primary"
            variant="solid"
            shape="rounded"
            duration={10}
            interval={1}
            size={item.value}
          >
            {item.label}按钮
          </CwCountDownButton>
        ))}
      </div>
    </div>
  )
}

export const Sizes: Story = {
  args: {
    type: 'primary',
    variant: 'solid',
    shape: 'rounded',
    duration: 10,
    interval: 1,
  },
  render: () => <SizesDemo />,
}

