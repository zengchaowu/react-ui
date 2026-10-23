import type { Meta, StoryObj } from '@storybook/react'
import { CwMoney } from './CwMoney'

const meta: Meta<typeof CwMoney> = {
  title: '1. Components/Display/CwMoney',
  component: CwMoney,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '金额展示组件。支持完整文本模式（currency + text）或数值模式（value + currency + decimals），三种尺寸 default/sm/xs，符合 README（Tailwind、tokens、styles 外部化）。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: '完整展示文本（优先）' },
    value: { control: 'number', description: '金额数值' },
    currency: { control: 'text', description: '货币符号' },
    decimals: { control: 'number', min: 0, max: 6, step: 1, description: '小数位数' },
    size: { control: 'select', options: ['default', 'sm', 'xs'], description: '尺寸' },
  },
}

export default meta
type Story = StoryObj<typeof CwMoney>

const wrap = 'bg-[var(--bg-color-secondarycontainer)] p-4'

export const Default: Story = {
  args: { value: 1234.56, currency: '¥', decimals: 2, size: 'default' },
  render: (args) => (
    <div className={wrap}>
      <CwMoney {...args} />
    </div>
  ),
}

export const IntegerOnly: Story = {
  args: { value: 168, currency: '¥', decimals: 0 },
  render: (args) => (
    <div className={wrap}>
      <CwMoney {...args} />
    </div>
  ),
}

export const NumericWithDecimals: Story = {
  args: { value: 168.08, currency: '¥', decimals: 2 },
  render: (args) => (
    <div className={wrap}>
      <CwMoney {...args} />
    </div>
  ),
}

export const SizeSm: Story = {
  args: { value: 1077, currency: '¥', decimals: 2, size: 'sm' },
  render: (args) => (
    <div className={wrap}>
      <CwMoney {...args} />
    </div>
  ),
}

export const SizeXs: Story = {
  args: { value: 512, currency: '¥', decimals: 2, size: 'xs' },
  render: (args) => (
    <div className={wrap}>
      <CwMoney {...args} />
    </div>
  ),
}

export const SizeCompare: Story = {
  render: () => (
    <div className={`${wrap} flex flex-col gap-6`}>
      <div>
        <div className="text-xs text-[var(--text-color-placeholder)] mb-2">default</div>
        <CwMoney value={1077} />
      </div>
      <div>
        <div className="text-xs text-[var(--text-color-placeholder)] mb-2">sm</div>
        <CwMoney value={1077} size="sm" />
      </div>
      <div>
        <div className="text-xs text-[var(--text-color-placeholder)] mb-2">xs</div>
        <CwMoney value={512} size="xs" />
      </div>
    </div>
  ),
}
