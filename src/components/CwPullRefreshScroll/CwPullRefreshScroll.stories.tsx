import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwPullRefreshScroll } from './CwPullRefreshScroll'

const meta: Meta<typeof CwPullRefreshScroll> = {
  title: '1. Components/Layout/CwPullRefreshScroll',
  component: CwPullRefreshScroll,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CwPullRefreshScroll>

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 24 }, (_, index) => `消息 ${index + 1}`),
    )
    const [hasMore, setHasMore] = useState(true)
    let page = 1

    const handleRefresh = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          page = 1
          setItems(Array.from({ length: 24 }, (_, index) => `刷新项 ${index + 1}`))
          setHasMore(true)
          resolve()
        }, 900)
      })

    const handleLoadMore = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          page += 1
          setItems((prev) => {
            const start = prev.length
            return [
              ...prev,
              ...Array.from({ length: 12 }, (_, index) => `追加 ${start + index + 1}`),
            ]
          })
          if (page >= 3) setHasMore(false)
          resolve()
        }, 900)
      })

    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col">
        <CwPullRefreshScroll
          className="min-h-0 flex-1"
          hasMore={hasMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
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
  },
}
