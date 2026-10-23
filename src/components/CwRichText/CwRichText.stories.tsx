import type { Meta, StoryObj } from '@storybook/react'
import { CwRichText } from './CwRichText'
import type { CwRichTextNode } from './types'

const meta: Meta<typeof CwRichText> = {
  title: '1. Components/Display/CwRichText',
  component: CwRichText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '富文本展示组件，通过 DSL 驱动，支持文本、链接、粗体、斜体、下划线等格式，并支持嵌套。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    dsl: {
      control: { type: 'object' },
      description: 'DSL 配置对象（节点数组）',
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '富文本尺寸',
    },
    onLinkClick: { action: 'link-click' },
  },
}

export default meta
type Story = StoryObj<typeof CwRichText>

const storyContainerClass = 'w-full max-w-2xl p-6'

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

export const Default: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '这是一段普通文本，包含一个',
      },
      {
        type: 'link',
        href: 'https://example.com',
        text: '链接',
      },
      {
        type: 'text',
        text: '。',
      },
    ] as CwRichTextNode[],
    disabled: false,
    readonly: false,
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText
        {...args}
        onLinkClick={(href, event) => {
          console.log('Link clicked:', href, event)
          event.preventDefault()
        }}
      />
    </div>
  ),
}

export const MultipleLinks: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '这是第一段文本，包含',
      },
      {
        type: 'link',
        href: 'https://example.com',
        text: '第一个链接',
      },
      {
        type: 'text',
        text: '。这是第二段文本，包含',
      },
      {
        type: 'link',
        href: 'https://google.com',
        text: '第二个链接',
      },
      {
        type: 'text',
        text: '。',
      },
    ] as CwRichTextNode[],
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText
        {...args}
        onLinkClick={(href, event) => {
          console.log('Link clicked:', href, event)
          event.preventDefault()
        }}
      />
    </div>
  ),
}

export const WithFormatting: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '这是一段包含',
      },
      {
        type: 'bold',
        children: [
          {
            type: 'text',
            text: '粗体',
          },
        ],
      },
      {
        type: 'text',
        text: '、',
      },
      {
        type: 'italic',
        children: [
          {
            type: 'text',
            text: '斜体',
          },
        ],
      },
      {
        type: 'text',
        text: '和',
      },
      {
        type: 'underline',
        children: [
          {
            type: 'text',
            text: '下划线',
          },
        ],
      },
      {
        type: 'text',
        text: '的文本。',
      },
    ] as CwRichTextNode[],
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText {...args} />
    </div>
  ),
}

export const DisabledState: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '禁用状态下的链接不会响应点击。',
      },
      {
        type: 'link',
        href: 'https://example.com',
        text: '查看详情',
      },
    ] as CwRichTextNode[],
    disabled: true,
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText {...args} />
    </div>
  ),
}

export const ReadonlyState: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '只读状态下仍可聚焦，但不会触发事件，示例：',
      },
      {
        type: 'link',
        href: 'https://example.com',
        text: '只读链接',
      },
    ] as CwRichTextNode[],
    readonly: true,
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText {...args} />
    </div>
  ),
}

export const NestedLink: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '这是一个包含',
      },
      {
        type: 'bold',
        children: [
          {
            type: 'link',
            href: 'https://example.com',
            text: '粗体链接',
          },
        ],
      },
      {
        type: 'text',
        text: '的文本。',
      },
    ] as CwRichTextNode[],
  },
  render: (args) => (
    <div className={storyContainerClass}>
      <CwRichText
        {...args}
        onLinkClick={(href, event) => {
          console.log('Link clicked:', href, event)
          event.preventDefault()
        }}
      />
    </div>
  ),
}

export const Sizes: Story = {
  args: {
    dsl: [
      {
        type: 'text',
        text: '这是一段',
      },
      {
        type: 'bold',
        children: [
          {
            type: 'text',
            text: '粗体',
          },
        ],
      },
      {
        type: 'text',
        text: '文本，包含一个',
      },
      {
        type: 'link',
        href: 'https://example.com',
        text: '链接',
      },
      {
        type: 'text',
        text: '。',
      },
    ] as CwRichTextNode[],
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value} className={storyContainerClass}>
            <div className="mb-2 text-xs text-[var(--text-color-secondary)]">{item.label}</div>
            <CwRichText {...args} size={item.value} />
          </div>
        ))}
      </div>
    </div>
  ),
}
