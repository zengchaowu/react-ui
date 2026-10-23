import type { Meta, StoryObj } from '@storybook/react'
import { CwCornerClosableWrap } from './CwCornerClosableWrap'

const demoChipClass =
  'flex h-20 w-20 items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-color)] bg-[var(--bg-color-container)] text-center text-xs leading-snug text-[var(--text-color-secondary)]'

const meta: Meta<typeof CwCornerClosableWrap> = {
  title: '1. Components/Display/CwCornerClosableWrap',
  component: CwCornerClosableWrap,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '在 slot 内容右上角叠加圆形关闭钮。关闭钮默认隐藏，鼠标悬停或 focus-within 时显示；内容需足够大（建议 ≥ 64px），否则关闭钮会被 overflow 裁切。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    closable: {
      control: { type: 'boolean' },
      description: '是否显示关闭钮（默认可关闭）',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '禁用时隐藏关闭钮',
    },
    rounded: {
      control: { type: 'boolean' },
      description: '关闭钮是否圆角容器',
    },
    texts: {
      control: false,
      description: '自定义文案',
    },
    onClose: { action: 'close' },
  },
  args: {
    closable: true,
    disabled: false,
    rounded: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-[var(--text-color-secondary)]">
        将鼠标移到方块上，右上角会出现关闭钮
      </p>
      <CwCornerClosableWrap {...args}>
        <div className={demoChipClass}>悬停显示<br />关闭</div>
      </CwCornerClosableWrap>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <CwCornerClosableWrap {...args}>
      <div className={[demoChipClass, 'opacity-70'].join(' ')}>禁用时不显示关闭钮</div>
    </CwCornerClosableWrap>
  ),
}

export const SquareCorners: Story = {
  args: {
    rounded: false,
  },
  render: (args) => (
    <CwCornerClosableWrap {...args}>
      <div className={[demoChipClass, 'rounded-none'].join(' ')}>直角容器</div>
    </CwCornerClosableWrap>
  ),
}
