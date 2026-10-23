import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import { CwPullRefreshScroll } from './CwPullRefreshScroll'

const meta: Meta<typeof CwPullRefreshScroll> = {
  title: '1. Components/Layout/CwPullRefreshScroll',
  component: CwPullRefreshScroll,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '列表容器：基于 CwDiv 滚动。顶部下拉刷新支持触摸与鼠标拖拽；触底加载更多。默认隐藏滚动条。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showScrollbar: {
      control: { type: 'boolean' },
      description: '是否常显 CwDiv 滚动条（默认 false）',
    },
    refreshDisabled: { control: { type: 'boolean' }, description: '禁用下拉刷新' },
    loadMoreDisabled: { control: { type: 'boolean' }, description: '禁用触底加载' },
    pullThreshold: {
      control: { type: 'number', min: 40, step: 8 },
      description: '下拉释放触发刷新的距离（px）',
    },
    loadMoreThreshold: {
      control: { type: 'number', min: 40, step: 8 },
      description: '距底部触发加载更多的距离（px）',
    },
    onRefresh: { control: false },
    onLoadMore: { control: false },
  },
  args: {
    showScrollbar: false,
    refreshDisabled: false,
    loadMoreDisabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function PullRefreshDemo(args: Story['args']) {
  const [items, setItems] = useState(() =>
    Array.from({ length: 24 }, (_, index) => `消息 ${index + 1}`),
  )
  const [hasMore, setHasMore] = useState(true)
  const [status, setStatus] = useState('滚到顶部后向下拖可刷新；滚到底部加载更多')
  const pageRef = useRef(1)

  const onRefresh = () =>
    new Promise<void>((resolve) => {
      setStatus('正在刷新…')
      setTimeout(() => {
        pageRef.current = 1
        setItems(Array.from({ length: 24 }, (_, index) => `刷新项 ${index + 1}`))
        setHasMore(true)
        setStatus('刷新完成')
        resolve()
      }, 900)
    })

  const onLoadMore = () =>
    new Promise<void>((resolve) => {
      setStatus('正在加载更多…')
      setTimeout(() => {
        pageRef.current += 1
        setItems((prev) => {
          const start = prev.length
          return [
            ...prev,
            ...Array.from({ length: 12 }, (_, index) => `追加 ${start + index + 1}`),
          ]
        })
        const nextHasMore = pageRef.current < 3
        setHasMore(nextHasMore)
        setStatus(nextHasMore ? '已加载更多' : '没有更多了')
        resolve()
      }, 900)
    })

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-[var(--bg-color-page)]">
      <div className="shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-4 py-2 text-xs text-[var(--text-color-secondary)]">
        {status}
      </div>
      <CwPullRefreshScroll
        {...args}
        hasMore={hasMore}
        className="min-h-0 flex-1"
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
      >
        <ul className="divide-y divide-[var(--border-color)]">
          {items.map((item) => (
            <li key={item} className="px-4 py-3 text-sm text-[var(--text-color-primary)]">
              {item}
            </li>
          ))}
        </ul>
      </CwPullRefreshScroll>
    </div>
  )
}

export const MobileList: Story = {
  parameters: {
    docs: {
      description: {
        story: '默认隐藏滚动条。在列表顶部向下拖触发刷新；滚到底部加载更多。',
      },
    },
  },
  render: (args) => <PullRefreshDemo {...args} />,
}

export const WithScrollbar: Story = {
  args: {
    showScrollbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'showScrollbar=true 时常显 CwDiv 滚动条。',
      },
    },
  },
  render: (args) => <PullRefreshDemo {...args} />,
}
