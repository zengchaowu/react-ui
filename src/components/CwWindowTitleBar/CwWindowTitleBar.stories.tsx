import type { Meta, StoryObj } from '@storybook/react'
import { CwWindowTitleBar } from './CwWindowTitleBar'

const meta: Meta<typeof CwWindowTitleBar> = {
  title: '1. Components/Navigation/CwWindowTitleBar',
  component: CwWindowTitleBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '自定义窗口顶栏组件，支持 macOS 交通灯圆点和 Windows 风格按钮两种模式。' +
          'macOS 模式在左上角显示红黄绿圆点，Windows 模式在右上角显示最小化/最大化/关闭图标。' +
          '底部分割线为 hairline-border-b（0.5px），与 CwTabbar / 侧栏外沿一致。',
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['mac', 'windows'],
      description: '操作系统风格',
    },
    title: { control: { type: 'text' }, description: '窗口标题文字' },
    showTitle: { control: { type: 'boolean' }, description: '是否显示标题' },
    closable: { control: { type: 'boolean' }, description: '是否可关闭' },
    minimizable: { control: { type: 'boolean' }, description: '是否可最小化' },
    maximizable: { control: { type: 'boolean' }, description: '是否可最大化' },
    maximized: { control: { type: 'boolean' }, description: '窗口是否已最大化' },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'fixed-height', 'flex-fill'],
      description: '官方外观',
    },
    background: {
      control: { type: 'select' },
      options: ['container', 'secondarycontainer'],
      description: '顶栏背景；secondarycontainer 与侧栏左侧区域一致',
    },
    titleSize: {
      control: { type: 'select' },
      options: ['md', 'sm'],
      description: '居中标题字号：md=14px，sm=caption',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwWindowTitleBar>

export const MacDefault: Story = {
  name: 'macOS 默认',
  args: {
    mode: 'mac',
    title: '终端',
    showTitle: true,
    closable: true,
    minimizable: true,
    maximizable: true,
    maximized: false,
  },
}

export const MacNoTitle: Story = {
  name: 'macOS 无标题',
  args: {
    mode: 'mac',
    title: '',
    showTitle: false,
    closable: true,
    minimizable: true,
    maximizable: true,
  },
}

export const WindowsDefault: Story = {
  name: 'Windows 默认',
  args: {
    mode: 'windows',
    title: '未命名 - 记事本',
    showTitle: true,
    closable: true,
    minimizable: true,
    maximizable: true,
    maximized: false,
  },
}

export const WindowsMaximized: Story = {
  name: 'Windows 最大化',
  args: {
    mode: 'windows',
    title: '文件夹',
    showTitle: true,
    closable: true,
    minimizable: true,
    maximizable: true,
    maximized: true,
  },
}

export const MacDisabledControls: Story = {
  name: 'macOS 仅有关闭',
  args: {
    mode: 'mac',
    title: '设置',
    showTitle: true,
    closable: true,
    minimizable: false,
    maximizable: false,
  },
}

export const WindowsDisabledControls: Story = {
  name: 'Windows 仅有关闭',
  args: {
    mode: 'windows',
    title: '关于',
    showTitle: true,
    closable: true,
    minimizable: false,
    maximizable: false,
  },
}

export const AppearanceFixedHeight: Story = {
  args: {
    appearance: 'fixed-height',
    mode: 'mac',
    title: '应用窗口',
  },
}

export const AppearanceFlexFill: Story = {
  args: {
    appearance: 'flex-fill',
    mode: 'windows',
    title: '文件夹',
  },
  render: (args) => (
    <div className="flex h-10 items-stretch border border-[var(--border-color)] bg-[var(--bg-color-page)]">
      <CwWindowTitleBar {...args} className="min-w-0 flex-1" />
    </div>
  ),
}

export const SecondaryBackgroundSmallTitle: Story = {
  name: '侧栏背景 + 小标题',
  args: {
    mode: 'windows',
    title: '我的项目',
    showTitle: true,
    background: 'secondarycontainer',
    titleSize: 'sm',
  },
}

