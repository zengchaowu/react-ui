import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwButton } from '../CwButton/CwButton'
import { CwShareSheet } from './CwShareSheet'
import { showShareSheet } from './showShareSheet'
import type { CwShareSheetOption, CwShareSheetProps } from './types'

const meta: Meta<typeof CwShareSheet> = {
  title: '1. Components/Overlay/CwShareSheet',
  component: CwShareSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "分享 Sheet 的函数式 API：showShareSheet(options) -> Promise<{ type: 'option', option } | { type: 'cancel' }>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' }, description: '标题' },
    options: { control: { type: 'object' }, description: '选项列表' },
    columns: {
      control: { type: 'number', min: 1, max: 6, step: 1 },
      description: '列数',
    },
    breakpoints: { control: { type: 'object' }, description: '响应式断点配置' },
    gutter: {
      control: { type: 'number', min: 0, max: 32, step: 4 },
      description: '栅格间隔',
    },
    rowGap: {
      control: { type: 'number', min: 0, max: 32, step: 4 },
      description: '行间距',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwShareSheet>

const defaultOptions: CwShareSheetOption[] = [
  {
    text: '微信好友',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png',
  },
  {
    text: '朋友圈',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat-moments.png',
  },
  {
    text: '下载名片',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-link.png',
  },
]

const moreOptions: CwShareSheetOption[] = [
  {
    text: '微信好友',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png',
  },
  {
    text: '朋友圈',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat-moments.png',
  },
  {
    text: 'QQ好友',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-qq.png',
  },
  {
    text: '复制链接',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-link.png',
  },
  {
    text: '分享海报',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-poster.png',
  },
  {
    text: '二维码',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-qrcode.png',
  },
]

interface ShareSheetDemoProps extends CwShareSheetProps {
  label: string
  options: CwShareSheetOption[]
  showSelected?: boolean
  note?: string
}

function ShareSheetDemo({
  label,
  options,
  showSelected = false,
  note,
  ...rest
}: ShareSheetDemoProps) {
  const [selectedOption, setSelectedOption] = useState<CwShareSheetOption | null>(
    null,
  )

  const handleShow = async () => {
    const result = await showShareSheet({ ...rest, options })
    setSelectedOption(result.type === 'option' ? result.option : null)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <CwButton type="primary" onClick={handleShow}>
        {label}
      </CwButton>
      {showSelected && selectedOption ? (
        <div className="text-sm text-[var(--text-color-secondary)]">
          已选择：{selectedOption.text}
        </div>
      ) : null}
      {note ? (
        <div className="max-w-md text-center text-xs text-[var(--text-color-placeholder)]">
          {note}
        </div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: {
    title: '分享至',
    options: defaultOptions,
  },
  render: (args) => (
    <ShareSheetDemo
      {...args}
      label="打开分享面板"
      options={args.options ?? defaultOptions}
      showSelected
    />
  ),
}

export const CustomOptions: Story = {
  args: {
    title: '分享至',
    options: [],
  },
  render: (args) => (
    <ShareSheetDemo
      {...args}
      label="打开分享面板（6个选项）"
      options={moreOptions}
    />
  ),
}

export const WithoutTitle: Story = {
  args: {
    title: '',
    options: defaultOptions,
  },
  render: (args) => (
    <ShareSheetDemo
      {...args}
      label="打开分享面板（无标题）"
      options={args.options ?? defaultOptions}
    />
  ),
}

const responsiveOptions: CwShareSheetOption[] = [
  ...moreOptions,
  {
    text: '更多',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-link.png',
  },
  {
    text: '保存',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-link.png',
  },
]

export const Responsive: Story = {
  args: {
    title: '分享至',
    options: [],
    columns: 3,
    gutter: 24,
    rowGap: 20,
    breakpoints: {
      xs: { columns: 2 },
      sm: { columns: 3 },
      md: { columns: 4 },
      lg: { columns: 5 },
      xl: { columns: 6 },
    },
  },
  render: (args) => (
    <ShareSheetDemo
      {...args}
      label="打开响应式分享面板"
      options={responsiveOptions}
      showSelected
      note="响应式配置：xs=2列，sm=3列，md=4列，lg=5列，xl=6列（支持任意列数）"
    />
  ),
}
