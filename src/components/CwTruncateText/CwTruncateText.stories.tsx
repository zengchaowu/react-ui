import type { Meta, StoryObj } from '@storybook/react'
import { CwTruncateText } from './CwTruncateText'

const meta: Meta<typeof CwTruncateText> = {
  title: '1. Components/Display/CwTruncateText',
  component: CwTruncateText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '单行缩略。`start` 省略末尾；`end` 省略开头（保留后缀，CSS rtl 技巧）；`filename` 按宽度保留前缀与扩展名；`middle` 中间省略。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    placement: {
      control: 'select',
      options: ['start', 'end', 'filename', 'middle'],
    },
    filenameHeadChars: { control: 'number', min: 1, max: 8 },
    title: { control: 'text' },
    tag: { control: 'select', options: ['span', 'div'] },
  },
}

export default meta
type Story = StoryObj<typeof CwTruncateText>

const longName =
  '2024年度项目验收材料-最终修订版-含附件清单-very-long-name.example.pdf'

const widths = [
  { label: '宽', className: 'w-[28rem]' },
  { label: '中', className: 'w-56' },
  { label: '窄', className: 'w-28' },
]

/** filename：按可用宽度尽量保留前缀 + 扩展名 */
export const Filename: Story = {
  args: {
    text: longName,
    placement: 'filename',
  },
  parameters: {
    docs: {
      description: {
        story: '按容器宽度测量，保留尽可能长的文件名前缀与扩展名。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-3 text-sm text-[var(--text-color-primary)]">
      {widths.map((w) => (
        <div
          key={w.label}
          className={`rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 ${w.className}`}
        >
          <p className="mb-1 text-xs text-[var(--text-color-placeholder)]">
            {w.label} · {w.className}
          </p>
          <CwTruncateText {...args} />
        </div>
      ))}
    </div>
  ),
}

/** 保留末尾：应显示 …long-name.example.pdf，而不是 2024年度… */
export const KeepEnd: Story = {
  args: {
    text: longName,
    placement: 'end',
  },
  render: (args) => (
    <div className="w-40 rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 text-sm text-[var(--text-color-primary)]">
      <CwTruncateText {...args} />
      <p className="mt-2 text-[0.625rem] leading-snug text-[var(--text-color-placeholder)]">
        期望：左侧省略号，右侧能看到 .pdf / 文件名尾部
      </p>
    </div>
  ),
}

export const KeepStart: Story = {
  args: {
    text: longName,
    placement: 'start',
  },
  render: (args) => (
    <div className="w-40 rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 text-sm text-[var(--text-color-primary)]">
      <CwTruncateText {...args} />
    </div>
  ),
}

export const Compare: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4 rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 text-sm text-[var(--text-color-primary)]">
      <div>
        <p className="mb-1 text-xs text-[var(--text-color-placeholder)]">filename（前缀…扩展名，铺满）</p>
        <CwTruncateText text={longName} placement="filename" />
      </div>
      <div>
        <p className="mb-1 text-xs text-[var(--text-color-placeholder)]">end（保留后缀，铺满省略）</p>
        <CwTruncateText text={longName} placement="end" />
      </div>
      <div>
        <p className="mb-1 text-xs text-[var(--text-color-placeholder)]">start（保留前缀，铺满省略）</p>
        <CwTruncateText text={longName} placement="start" />
      </div>
    </div>
  ),
}
