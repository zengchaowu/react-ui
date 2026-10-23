import type { Meta, StoryObj } from '@storybook/react'
import { CwDivider } from './CwDivider'

const meta: Meta<typeof CwDivider> = {
  title: '1. Components/Display/CwDivider',
  component: CwDivider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '文档流内容分割线（两段内容之间）。默认发丝线 + `--border-color`。可夹中间文案。盒子描边请用 `hairline-border-*`，不要用本组件去描卡片/输入框/页面壳。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    vertical: { control: { type: 'boolean' }, description: '垂直方向' },
    show: { control: { type: 'boolean' }, description: '是否显示' },
    hairline: { control: { type: 'boolean' }, description: '发丝线（0.5px），默认 true' },
    dashed: { control: { type: 'boolean' }, description: '虚线' },
    content: { control: { type: 'text' }, description: '中间文案' },
    contentPosition: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: '文案位置',
    },
    dense: { control: { type: 'boolean' }, description: '紧凑间距' },
    bold: { control: { type: 'boolean' }, description: '文案加粗' },
    disabled: { control: { type: 'boolean' }, description: '禁用文案色' },
  },
}

export default meta
type Story = StoryObj<typeof CwDivider>

const frameClass =
  'w-[25rem] overflow-hidden rounded-[var(--radius-default)] border border-[var(--border-color)] bg-[var(--bg-color-container)]'

export const Default: Story = {
  name: '默认（Hairline）',
  args: {
    vertical: false,
    show: true,
    hairline: true,
  },
  render: (args) => (
    <div className={frameClass}>
      <div className="p-4 text-[var(--text-color-primary)]">上方内容</div>
      <CwDivider {...args} />
      <div className="p-4 text-[var(--text-color-primary)]">下方内容</div>
    </div>
  ),
}

export const Vertical: Story = {
  name: '垂直',
  args: {
    vertical: true,
    show: true,
    hairline: true,
  },
  render: (args) => (
    <div className="flex h-[12.5rem] items-stretch overflow-hidden rounded-[var(--radius-default)] border border-[var(--border-color)] bg-[var(--bg-color-container)]">
      <div className="flex flex-1 items-center p-4 text-[var(--text-color-primary)]">左侧</div>
      <CwDivider {...args} />
      <div className="flex flex-1 items-center p-4 text-[var(--text-color-primary)]">右侧</div>
    </div>
  ),
}

export const Thick: Story = {
  name: '1px（hairline=false）',
  args: {
    hairline: false,
  },
  render: (args) => (
    <div className={frameClass}>
      <div className="p-4 text-[var(--text-color-primary)]">上方内容</div>
      <CwDivider {...args} />
      <div className="p-4 text-[var(--text-color-primary)]">1px 分割线</div>
    </div>
  ),
}

export const WithLabel: Story = {
  name: '中间文案',
  args: {
    content: '账户与服务',
  },
  render: (args) => (
    <div className={frameClass}>
      <div className="p-4 text-sm text-[var(--text-color-primary)]">资料</div>
      <CwDivider {...args} />
      <div className="p-4 text-sm text-[var(--text-color-primary)]">安全设置</div>
    </div>
  ),
}

export const LabelPosition: Story = {
  name: '文案左 / 中 / 右',
  render: () => (
    <div className={`${frameClass} flex flex-col gap-3 p-4`}>
      <CwDivider content="左侧" contentPosition="left" />
      <CwDivider content="居中" contentPosition="center" />
      <CwDivider content="右侧" contentPosition="right" />
    </div>
  ),
}

export const Dashed: Story = {
  name: '虚线',
  args: {
    dashed: true,
    content: '更多',
  },
  render: (args) => (
    <div className={frameClass}>
      <div className="p-4 text-sm text-[var(--text-color-primary)]">已展开内容</div>
      <CwDivider {...args} />
      <div className="p-4 text-sm text-[var(--text-color-secondary)]">折叠区</div>
    </div>
  ),
}

export const SlotLabel: Story = {
  name: '默认插槽',
  render: () => (
    <div className={frameClass}>
      <div className="p-4 text-sm text-[var(--text-color-primary)]">自定义节点</div>
      <CwDivider>
        <span className="text-[var(--brand-color-6)]">查看全部</span>
      </CwDivider>
      <div className="p-4 text-sm text-[var(--text-color-secondary)]">列表</div>
    </div>
  ),
}
