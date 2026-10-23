import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwDiv } from './CwDiv'
import type { CwDivComponentProps } from './CwDiv'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwDiv> = {
  title: '1. Components/Layout/CwDiv',
  component: CwDiv,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用于替换原生 div 的轻量容器组件，内置仿 macOS Chrome 的滚动条样式，使用方式与 div 完全一致。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    hideScrollbar: {
      control: { type: 'boolean' },
      description: '完全隐藏自定义滚动条（仍可滚动）',
    },
    persistScrollbar: {
      control: { type: 'boolean' },
      description: '有溢出时滚动条常显',
    },
    viewportClass: {
      control: { type: 'text' },
      description: '追加到视口滚动区域的 class',
    },
    contentClass: {
      control: { type: 'text' },
      description: '追加到内容内层（padding 请挂这里，勿挂根 class）',
    },
    scrollbarVerticalClass: {
      control: { type: 'text' },
      description: '追加到垂直滚动条轨道 class',
    },
    texts: { control: false },
  },
  args: {
    hideScrollbar: false,
    persistScrollbar: false,
  },
}

export default meta
type Story = StoryObj<typeof CwDiv>

const longList = Array.from({ length: 40 }, (_, i) => `行 ${i + 1}`)

const scrollBoxClass =
  'w-[22.5rem] h-[12.5rem] border border-dashed border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-color-container)] shadow-sm'

/** 可在右侧 Controls 切换 hideScrollbar / persistScrollbar 等 props */
export const Basic: Story = {
  args: {
    contentClass: 'p-4',
  },
  render: (args) => (
    <CwDiv {...args} className={scrollBoxClass}>
      <div className="space-y-3 text-sm text-[var(--text-color-secondary)] leading-6">
        <p>
          这是一个基础的 CwDiv 示例。与原生 div 一样，可以传入任意 class、style、属性和事件。
        </p>
        <p>
          当内容超出可视区域时，滚动条会展示为细窄、半透明的胶囊形状，悬停时略微加深，接近 macOS 上的
          Chrome 风格。
        </p>
        <p>
          同样支持横向滚动，多端兼容性良好，默认情况下不影响布局，只针对滚动条进行细节美化。
        </p>
        <p>下面填充一些额外内容演示滚动效果：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>支持自然滚动体验。</li>
          <li>hover 时滚动条会加深。</li>
          <li>宽度约为 8px，避免视觉干扰。</li>
          <li>可以安全替换现有的 div。</li>
          <li>不影响内部组件与事件。</li>
        </ul>
      </div>
    </CwDiv>
  ),
}

export const HorizontalScroll: Story = {
  render: (args) => (
    <CwDiv
      {...args}
      contentClass="p-4"
      className="w-[22.5rem] h-[8.75rem] border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-color-container)]"
    >
      <div className="w-[45rem] text-sm text-[var(--text-color-secondary)] space-y-2">
        <p>当内容需要横向滚动时，也会保留相同风格的滚动条。</p>
        <div className="bg-[var(--bg-color-secondary)] text-[var(--text-color-primary)] px-4 py-2 rounded">
          渐隐式滚动条示例：向右拖动查看剩余内容。
        </div>
        <p>横向滚动条同样采用 8px 胶囊形态，并与纵向滚动条保持一致的 hover 反馈。</p>
      </div>
    </CwDiv>
  ),
}

export const DynamicContent: Story = {
  render: (args) => <DynamicContentDemo args={args} />,
}

function DynamicContentDemo({ args }: { args: CwDivComponentProps }) {
  const [items, setItems] = useState(() =>
    Array.from({ length: 6 }, (_, i) => `动态行 ${i + 1}`),
  )
  const append = () => {
    setItems((prev) => [...prev, `动态行 ${prev.length + 1}`])
  }
  const reset = () => {
    setItems(Array.from({ length: 3 }, (_, i) => `动态行 ${i + 1}`))
  }
  return (
    <div className="w-[22.5rem] space-y-3">
      <div className="flex gap-2">
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer px-3 py-1.5 rounded bg-[var(--brand-color-6)] text-[var(--text-color-anti)] text-sm"
          onClick={append}
        >
          追加一行
        </div>
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer px-3 py-1.5 rounded border border-[var(--border-color)] text-sm"
          onClick={reset}
        >
          重置
        </div>
      </div>
      <CwDiv
        {...args}
        contentClass="p-4"
        className="h-[11.25rem] border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-color-container)]"
      >
        <ul className="space-y-2 text-sm text-[var(--text-color-secondary)]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CwDiv>
    </div>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: (args) => (
    <div className="w-[22.5rem]">
      <SlotStorySection slot="default">
        <CwDiv
          {...args}
          contentClass="p-4"
          className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-container)] shadow-sm"
        >
          <p className="text-sm leading-6 text-[var(--text-color-secondary)]">
            通过 <code className="text-xs">#default</code> 插槽包裹的自定义内容，样式与原生 div
            用法一致。
          </p>
        </CwDiv>
      </SlotStorySection>
    </div>
  ),
}

/** 完全隐藏自定义滚动条（仍可滚动） */
export const HideScrollbar: Story = {
  args: {
    hideScrollbar: true,
    persistScrollbar: false,
  },
  render: (args) => (
    <div className="flex w-[22.5rem] flex-col gap-2">
      <p className="text-xs text-[var(--text-color-secondary)]">
        hideScrollbar · 无轨道/滑块，滚轮仍可滚（Controls 可改回）
      </p>
      <CwDiv
        {...args}
        contentClass="p-4"
        className="h-[12.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]"
      >
        <ul className="space-y-2 text-sm text-[var(--text-color-secondary)]">
          {longList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CwDiv>
    </div>
  ),
}

/** 有溢出时滚动条常显 */
export const PersistScrollbar: Story = {
  args: {
    hideScrollbar: false,
    persistScrollbar: true,
  },
  render: (args) => (
    <div className="flex w-[22.5rem] flex-col gap-2">
      <p className="text-xs text-[var(--text-color-secondary)]">
        persistScrollbar · 溢出时常显（Controls 可改回）
      </p>
      <CwDiv
        {...args}
        contentClass="p-4"
        className="h-[12.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]"
      >
        <ul className="space-y-2 text-sm text-[var(--text-color-secondary)]">
          {longList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CwDiv>
    </div>
  ),
}
