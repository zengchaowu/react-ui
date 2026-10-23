import type { Meta, StoryObj } from '@storybook/react'
import { CwFunctionGrid } from './CwFunctionGrid'
import type { CwFunctionGridItem, CwFunctionGridProps } from './types'

const meta: Meta<typeof CwFunctionGrid> = {
  title: '1. Components/Display/CwFunctionGrid',
  component: CwFunctionGrid,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '常用功能网格：标题栏 + 功能入口。布局基于 CwGrid（CwRow/CwCol），图标使用 iconfont `font_class`。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: false,
      description: '功能项列表',
    },
    columns: {
      control: { type: 'number', min: 1, max: 24 },
      description: '每行列数（默认 4）',
    },
    showAllStoresLink: {
      control: { type: 'boolean' },
      description: '是否显示全部门店链接',
    },
    texts: {
      control: false,
      description: '文本配置',
    },
    onAllStoresClick: { action: 'allStoresClick' },
  },
}

export default meta
type Story = StoryObj<typeof CwFunctionGrid>

const mockItems: CwFunctionGridItem[] = [
  { key: 'meituan', icon: 'common--commerce--coupon-line', label: '美团验券' },
  { key: 'douyin', icon: 'common--media--camera-line', label: '抖音验券' },
  { key: 'amap', icon: 'common--nav--location-filled', label: '高德验券' },
  { key: 'wifi', icon: 'common--nav--wifi-line', label: 'WiFi连接' },
  { key: 'favorite', icon: 'common--status--star-line', label: '收藏门店' },
  { key: 'checkin', icon: 'common--time--calendar-line', label: '每日签到' },
  { key: 'invite', icon: 'common--commerce--gift-line', label: '邀请福利' },
  { key: 'show', icon: 'common--media--camera-filled', label: '精彩秀' },
  { key: 'deposit', icon: 'common--commerce--cart-line', label: '存取杆' },
]

function renderFunctionGrid(args: CwFunctionGridProps) {
  return (
    <div className="w-[22.5rem]">
      <CwFunctionGrid
        items={args.items ?? []}
        columns={args.columns}
        showAllStoresLink={args.showAllStoresLink}
        texts={args.texts}
        onAllStoresClick={args.onAllStoresClick}
      />
    </div>
  )
}

export const Default: Story = {
  args: {
    items: mockItems,
    columns: 4,
    showAllStoresLink: true,
    texts: {
      title: '常用功能',
      allStores: '全部门店',
    },
  },
  render: (args) => renderFunctionGrid(args),
}

export const ThreeColumns: Story = {
  args: {
    items: mockItems.slice(0, 6),
    columns: 3,
    showAllStoresLink: true,
    texts: {
      title: '常用功能',
      allStores: '全部门店',
    },
  },
  render: (args) => renderFunctionGrid(args),
}

export const WithoutLink: Story = {
  args: {
    items: mockItems.slice(0, 8),
    columns: 4,
    showAllStoresLink: false,
    texts: {
      title: '常用功能',
    },
  },
  render: (args) => renderFunctionGrid(args),
}

export const WithDisabledItems: Story = {
  args: {
    items: [
      { key: 'meituan', icon: 'common--commerce--coupon-line', label: '美团验券' },
      { key: 'douyin', icon: 'common--media--camera-line', label: '抖音验券', disabled: true },
      { key: 'amap', icon: 'common--nav--location-filled', label: '高德验券' },
      { key: 'wifi', icon: 'common--nav--wifi-line', label: 'WiFi连接', disabled: true },
      { key: 'favorite', icon: 'common--status--star-line', label: '收藏门店' },
      { key: 'checkin', icon: 'common--time--calendar-line', label: '每日签到' },
      { key: 'invite', icon: 'common--commerce--gift-line', label: '邀请福利' },
      { key: 'show', icon: 'common--media--camera-filled', label: '精彩秀' },
    ],
    columns: 4,
    showAllStoresLink: true,
    texts: {
      title: '常用功能',
      allStores: '全部门店',
    },
  },
  render: (args) => renderFunctionGrid(args),
}
