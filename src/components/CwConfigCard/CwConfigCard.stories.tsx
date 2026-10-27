import type { Meta, StoryObj } from '@storybook/react'
import { CwConfigCard } from './CwConfigCard'
import { CwTag } from '../CwTag'
import type { CwConfigCardItem } from './types'
import type { CwRichTextNode } from '@zengchaowu/ui-shared/components/CwRichText/types'

const meta: Meta<typeof CwConfigCard> = {
  title: '1. Components/Display/CwConfigCard',
  component: CwConfigCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通用配置化卡片组件，通过 items 配置展示 label-value 对，支持富文本和组件渲染。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: '卡片标题',
    },
    collapsible: {
      control: { type: 'boolean' },
      description: '是否可折叠',
    },
    defaultExpanded: {
      control: { type: 'boolean' },
      description: '默认是否展开',
    },
    items: {
      control: false,
      description: '配置项列表',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwConfigCard>

// 示例数据：订单信息
const orderItems: CwConfigCardItem[] = [
  {
    key: 'status',
    label: '订单状态',
    value: '支付成功',
    valueColor: 'text-[var(--brand-color-6)]',
  },
  {
    key: 'amount',
    label: '订单总金额',
    value: '168.08元',
    valueColor: 'text-[var(--brand-color-6)] font-semibold',
  },
  {
    key: 'orderNo',
    label: '订单号',
    value: '2507022000218147797',
  },
  {
    key: 'productName',
    label: '产品名称',
    value: '中华好医保·重疾险',
  },
  {
    key: 'productInfo',
    label: '产品信息',
    value: [
      { type: 'link', href: '#', text: '《产品条款》' },
      { type: 'text', text: '、' },
      { type: 'link', href: '#', text: '《投保须知》' },
      { type: 'text', text: '、' },
      { type: 'link', href: '#', text: '《特别约定》' },
    ] as CwRichTextNode[],
  },
  {
    key: 'plan',
    label: '保障计划',
    value: '基础版',
  },
  {
    key: 'startDate',
    label: '起保日期',
    value: '2025年07月06日 00:00:00',
  },
  {
    key: 'endDate',
    label: '终保日期',
    value: '2026年07月05日 23:59:59',
  },
]

const handleRichTextLinkClick = (href: string, event: MouseEvent) => {
  console.log('Rich text link clicked:', href, event)
  event.preventDefault()
}

export const Default: Story = {
  args: {
    title: '订单信息',
    collapsible: false,
    items: orderItems,
  },
  render: (args) => (
    <div style={{ width: 600 }}>
      <CwConfigCard {...args} onRichTextLinkClick={handleRichTextLinkClick} />
    </div>
  ),
}

export const Collapsible: Story = {
  args: {
    title: '订单信息',
    collapsible: true,
    defaultExpanded: true,
    items: orderItems,
  },
  render: (args) => (
    <div style={{ width: 600 }}>
      <CwConfigCard
        {...args}
        onExpandChange={(expanded) => console.log('Expand changed:', expanded)}
        onRichTextLinkClick={handleRichTextLinkClick}
      />
    </div>
  ),
}

export const WithComponent: Story = {
  args: {
    title: '订单信息',
    collapsible: false,
    items: [
      {
        key: 'status',
        label: '订单状态',
        value: '支付成功',
        component: CwTag,
        componentProps: { type: 'success', children: '支付成功' },
      },
      {
        key: 'amount',
        label: '订单总金额',
        value: '168.08元',
      },
      {
        key: 'orderNo',
        label: '订单号',
        value: '2507022000218147797',
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 600 }}>
      <CwConfigCard {...args} />
    </div>
  ),
}

export const WithRichTextProp: Story = {
  args: {
    title: '订单信息',
    collapsible: false,
    items: [
      {
        key: 'status',
        label: '订单状态',
        value: '支付成功',
      },
      {
        key: 'productInfo',
        label: '产品信息',
        value: '点击查看',
        richText: [
          { type: 'link', href: '#', text: '《产品条款》' },
          { type: 'text', text: '、' },
          { type: 'link', href: '#', text: '《投保须知》' },
          { type: 'text', text: '、' },
          { type: 'link', href: '#', text: '《特别约定》' },
        ] as CwRichTextNode[],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 600 }}>
      <CwConfigCard {...args} onRichTextLinkClick={handleRichTextLinkClick} />
    </div>
  ),
}

export const LongValue: Story = {
  args: {
    title: '订单信息',
    collapsible: false,
    items: [
      {
        key: 'description',
        label: '描述',
        value:
          '这是一段很长的描述文本，用来测试 value 是否可以正确换行显示。当文本内容超过容器宽度时，应该自动换行到下一行，而不是溢出容器边界。',
      },
      {
        key: 'multiline',
        label: '多行内容',
        value: [
          { type: 'text', text: '第一行文本内容。' },
          { type: 'br' },
          { type: 'text', text: '第二行文本内容，包含一个' },
          { type: 'link', href: '#', text: '链接' },
          { type: 'text', text: '。' },
          { type: 'br' },
          { type: 'text', text: '第三行文本内容。' },
        ] as CwRichTextNode[],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <CwConfigCard {...args} onRichTextLinkClick={handleRichTextLinkClick} />
    </div>
  ),
}
