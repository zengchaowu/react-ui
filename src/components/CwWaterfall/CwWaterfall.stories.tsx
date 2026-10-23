import type { Meta, StoryObj } from '@storybook/react'
import { CwWaterfall } from './CwWaterfall'
import type { CwWaterfallItem } from './types'

const items: CwWaterfallItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `item-${index}`,
  height: 80 + (index % 3) * 30,
  content: `Item ${index + 1}`,
}))

const meta: Meta<typeof CwWaterfall> = {
  title: '1. Components/Layout/CwWaterfall',
  component: CwWaterfall,
}

export default meta
type Story = StoryObj<typeof CwWaterfall>

export const Default: Story = {
  args: {
    items,
    columnCount: 3,
    columnGap: 12,
    rowGap: 12,
    infiniteScroll: false,
    children: ({ item }) => (
      <div className="rounded-md border border-[var(--border-color)] p-3">
        {String(item.content ?? item.id)}
      </div>
    ),
  },
}
