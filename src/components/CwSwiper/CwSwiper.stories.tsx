import type { Meta, StoryObj } from '@storybook/react'
import { CwSwiper } from './CwSwiper'
import type { CwSwiperItem } from './types'

const items: CwSwiperItem[] = Array.from({ length: 6 }, (_, index) => ({
  key: `slide-${index}`,
  data: { title: `Slide ${index + 1}` },
  image: `https://picsum.photos/600/400?random=${index}`,
}))

const meta: Meta<typeof CwSwiper> = {
  title: '1. Components/Media/CwSwiper',
  component: CwSwiper,
}

export default meta
type Story = StoryObj<typeof CwSwiper>

export const Default: Story = {
  args: {
    items,
    itemWidth: 320,
    snapToPage: true,
    children: ({ item, index }) => (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-[var(--bg-color-secondarycontainer)] text-sm">
        {item.image ? (
          <img src={item.image} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          `Item ${index + 1}`
        )}
      </div>
    ),
  },
}
