import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwInfiniteScroll } from './CwInfiniteScroll'

const meta: Meta<typeof CwInfiniteScroll> = {
  title: '1. Components/Layout/CwInfiniteScroll',
  component: CwInfiniteScroll,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '无限滚动。滚到顶部附近触发下拉加载（往前追加），滚到底部附近触发上拉加载（往后追加）。',
      },
    },
  },
  argTypes: {
    pullDownEnabled: {
      control: { type: 'boolean' },
      description: '是否允许下拉加载',
    },
    pullUpEnabled: {
      control: { type: 'boolean' },
      description: '是否允许上拉加载',
    },
    triggerPullDown: {
      control: false,
      description: '触发下拉加载的回调',
    },
    triggerPullUp: {
      control: false,
      description: '触发上拉加载的回调',
    },
    scrollTopTrigger: {
      control: { type: 'number' },
      description: '距顶部多少 px 内触发下拉',
    },
    clientHeightTrigger: {
      control: { type: 'number' },
      description: '距底部多少 px 内触发上拉',
    },
    className: {
      control: { type: 'text' },
      description: '自定义 CSS 类名',
    },
    showScrollbar: {
      control: { type: 'boolean' },
      description: '是否常显 CwDiv 滚动条（默认 false）',
    },
  },
  args: {
    pullDownEnabled: true,
    pullUpEnabled: true,
    scrollTopTrigger: 150,
    clientHeightTrigger: 150,
    showScrollbar: false,
    className: 'h-full min-h-0 w-full',
  },
}

export default meta
type Story = StoryObj<typeof meta>

type DemoItem = { id: number; label: string }

function InfiniteScrollDemo(props: Story['args']) {
  const nextIdRef = useRef(1)
  const [items, setItems] = useState<DemoItem[]>(() =>
    Array.from({ length: 20 }, () => {
      const id = nextIdRef.current++
      return { id, label: `列表项 ${id}` }
    }),
  )
  const [status, setStatus] = useState(
    '顶部继续上滑可加载更早内容，底部继续下滑可加载更多',
  )
  const [loadingDown, setLoadingDown] = useState(false)
  const [loadingUp, setLoadingUp] = useState(false)

  const makeItems = (count: number, prefix: string) =>
    Array.from({ length: count }, () => {
      const id = nextIdRef.current++
      return { id, label: `${prefix} ${id}` }
    })

  const handlePullDown = async () => {
    if (loadingDown || loadingUp) return
    setLoadingDown(true)
    setStatus('正在下拉加载…')
    await new Promise<void>((resolve) => setTimeout(resolve, 600))
    setItems((prev) => {
      const next = [...makeItems(5, '更早内容'), ...prev]
      setStatus(`下拉完成，当前 ${next.length} 条`)
      return next
    })
    setLoadingDown(false)
  }

  const handlePullUp = async () => {
    if (loadingDown || loadingUp) return
    setLoadingUp(true)
    setStatus('正在上拉加载…')
    await new Promise<void>((resolve) => setTimeout(resolve, 600))
    setItems((prev) => {
      const next = [...prev, ...makeItems(10, '列表项')]
      setStatus(`上拉完成，当前 ${next.length} 条`)
      return next
    })
    setLoadingUp(false)
  }

  return (
    <div className="flex h-[100vh] flex-col bg-[var(--bg-color-page)]">
      <div className="shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-4 py-2 text-sm text-[var(--text-color-secondary)]">
        {status}
        {loadingDown || loadingUp ? (
          <span className="ml-2 text-[var(--brand-color)]">加载中</span>
        ) : null}
      </div>
      <CwInfiniteScroll
        {...props}
        className="min-h-0 flex-1"
        triggerPullDown={handlePullDown}
        triggerPullUp={handlePullUp}
      >
        <div className="p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="mb-2 rounded border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-3 transition-colors hover:bg-[var(--bg-color-component-hover)]"
            >
              {item.label}
            </div>
          ))}
        </div>
      </CwInfiniteScroll>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <InfiniteScrollDemo {...args} />,
}

/** 常显滚动条 */
export const WithScrollbar: Story = {
  args: {
    showScrollbar: true,
  },
  render: (args) => <InfiniteScrollDemo {...args} />,
}

const slotItems = [
  { id: 1, label: '自定义列表项 1' },
  { id: 2, label: '自定义列表项 2' },
  { id: 3, label: '自定义列表项 3' },
]

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    pullDownEnabled: true,
    pullUpEnabled: true,
    scrollTopTrigger: 150,
    clientHeightTrigger: 150,
  },
  render: (args) => (
    <SlotStorySection slot="default">
      <CwInfiniteScroll
        {...args}
        className="h-[17.5rem] w-full rounded-lg border border-[var(--border-color)]"
      >
        <div className="p-4">
          {slotItems.map((item) => (
            <div
              key={item.id}
              className="mb-2 rounded border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3 text-sm text-[var(--text-color-primary)]"
            >
              {item.label}
            </div>
          ))}
        </div>
      </CwInfiniteScroll>
    </SlotStorySection>
  ),
}
