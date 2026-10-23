import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwInfiniteScroll } from './CwInfiniteScroll'

const meta: Meta<typeof CwInfiniteScroll> = {
  title: '1. Components/Layout/CwInfiniteScroll',
  component: CwInfiniteScroll,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CwInfiniteScroll>

type DemoItem = { id: number; label: string }

const makeItems = (count: number, prefix: string, startId: number): DemoItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    label: `${prefix} ${startId + index}`,
  }))

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState<DemoItem[]>(() => makeItems(20, '列表项', 1))

    return (
      <div className="flex h-[100dvh] flex-col">
        <CwInfiniteScroll
          className="min-h-0 flex-1"
          pullDownEnabled
          pullUpEnabled
          scrollTopTrigger={150}
          clientHeightTrigger={150}
          triggerPullDown={async () => {
            await new Promise((resolve) => setTimeout(resolve, 600))
            setItems((prev) => [...makeItems(5, '更早内容', prev[0].id - 5), ...prev])
          }}
          triggerPullUp={async () => {
            await new Promise((resolve) => setTimeout(resolve, 600))
            setItems((prev) => [...prev, ...makeItems(10, '列表项', prev[prev.length - 1].id + 1)])
          }}
        >
          <div className="p-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="mb-2 rounded border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-3"
              >
                {item.label}
              </div>
            ))}
          </div>
        </CwInfiniteScroll>
      </div>
    )
  },
}
