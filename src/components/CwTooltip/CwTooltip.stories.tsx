import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwTooltip } from './CwTooltip'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwTooltip> = {
  title: '1. Components/Overlay/CwTooltip',
  component: CwTooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwTooltip 基于 CwPopup 构建，提供轻量的提示信息展示能力，支持箭头、延迟、手动控制等增强配置。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: [
        'top',
        'top-start',
        'top-end',
        'right',
        'right-start',
        'right-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
      ],
      description: '提示框的出现位置',
    },
    trigger: {
      control: { type: 'select' },
      options: ['hover', 'click', 'manual'],
      description: '触发方式',
    },
    content: {
      control: { type: 'text' },
      description: '未提供插槽时显示的内容',
    },
    showArrow: {
      control: { type: 'boolean' },
      description: '是否展示箭头',
    },
    offset: {
      control: { type: 'number', min: 0, max: 48, step: 1 },
      description: '触发器与提示框之间的垂直/水平偏移量',
    },
    viewportPadding: {
      control: { type: 'number', min: 0, max: 64, step: 1 },
      description: '防止提示框溢出视口的内边距',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'inline', 'mention'],
      description: '场景外观',
    },
    texts: { control: false },
    plugins: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof CwTooltip>

const basicTrigger = (
  <span className="px-3 py-1 rounded-md bg-[var(--brand-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none">
    悬停查看提示
  </span>
)

export const Basic: Story = {
  args: {
    placement: 'top',
    trigger: 'hover',
    content: '在丰富的信息密度场景中使用 Tooltip 提醒用户关注细节。',
  },
  render: (args) => (
    <CwTooltip {...args}>
      <span className="px-3 py-1 rounded-md bg-[var(--brand-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none">
        悬停查看提示
      </span>
    </CwTooltip>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="trigger">
      <CwTooltip
        placement="top"
        trigger="hover"
        content="悬停触发区域查看提示内容。"
        triggerSlot={
          <span className="px-3 py-1 rounded-md bg-[var(--brand-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none">
            悬停查看提示
          </span>
        }
      />
    </SlotStorySection>
  ),
}

function ManualTooltipDemo() {
  const [visible, setVisible] = useState(false)
  return (
    <div className="flex flex-col items-center gap-4">
      <CwTooltip
        trigger="manual"
        showArrow
        closeOnClickOutside={false}
        content="通过 v-model 手动控制 tooltip 的显示和隐藏。"
        value={visible}
        onChange={setVisible}
        triggerSlot={
          <div
            className="px-3 py-1 rounded-md bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)] cursor-pointer select-none"
            onClick={() => setVisible((prev) => !prev)}
          >
            点击或外部按钮控制
          </div>
        }
      />
      <div className="flex gap-3">
        <div
          className="px-3 py-1 rounded-md bg-[var(--brand-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none"
          onClick={() => setVisible(true)}
        >
          显示提示
        </div>
        <div
          className="px-3 py-1 rounded-md bg-[var(--error-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none"
          onClick={() => setVisible(false)}
        >
          隐藏提示
        </div>
      </div>
    </div>
  )
}

export const ManualControl: Story = {
  args: {
    trigger: 'manual',
    showArrow: true,
    closeOnClickOutside: false,
    content: '通过 v-model 手动控制 tooltip 的显示和隐藏。',
  },
  render: () => <ManualTooltipDemo />,
}

export const AppearanceInline: Story = {
  args: {
    appearance: 'inline',
    content: 'inline：行内触发',
  },
  render: (args) => (
    <CwTooltip {...args}>
      <span className="rounded-md bg-[var(--brand-color-6)] px-2 py-1 text-xs text-[var(--text-color-anti)]">
        inline
      </span>
    </CwTooltip>
  ),
}

export const AppearanceMention: Story = {
  args: {
    appearance: 'mention',
    content: '@某人',
  },
  render: (args) => (
    <CwTooltip {...args}>
      <span className="text-sm text-[var(--brand-color-6)]">@mention</span>
    </CwTooltip>
  ),
}
