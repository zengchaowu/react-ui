import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwWaterfall } from './CwWaterfall'
import { CwVideoPlayer } from '../CwVideoPlayer'
import { CwLoading } from '../CwLoading'
import type { CwWaterfallItem, CwWaterfallProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

// 生成测试数据
function generateItems(count: number): CwWaterfallItem[] {
  return Array.from({ length: count }, (_, i) => {
    // 先确定一个固定的高度值，确保图片URL和height属性一致
    const itemHeight = Math.floor(Math.random() * 150) + 200

    // 随机决定是否为视频项目，视频项目数量少于图片项目
    const isVideo = Math.random() < 0.1

    return {
      id: `item-${i}`,
      title: `Item ${i + 1}`,
      height: itemHeight, // 使用固定的高度值
      imageUrl: isVideo
        ? undefined
        : `https://picsum.photos/400/${itemHeight}?random=${i}`, // 图片项目使用图片URL
      videoUrl: isVideo
        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
        : undefined, // 视频项目使用视频URL
      isVideo,
      content: `这是第 ${i + 1} 个瀑布流${isVideo ? '视频' : '图片'}项目的内容`,
    }
  })
}

const meta: Meta<typeof CwWaterfall> = {
  title: '1. Components/Layout/CwWaterfall',
  component: CwWaterfall,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '瀑布流布局。滚动与滚动条基于 CwDiv；默认隐藏滚动条，showScrollbar 时可常显。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columnCount: {
      control: { type: 'number', min: 1, max: 6 },
      description: '列数，不设置则根据断点自动计算',
    },
    columnGap: {
      control: { type: 'number', min: 0, max: 40 },
      description: '列间距',
    },
    rowGap: {
      control: { type: 'number', min: 0, max: 40 },
      description: '行间距',
    },
    lazyLoad: {
      control: 'boolean',
      description: '是否开启懒加载',
    },
    infiniteScroll: {
      control: 'boolean',
      description: '是否开启无限滚动',
    },
    loading: {
      control: 'boolean',
      description: '是否正在加载更多数据',
    },
    finished: {
      control: 'boolean',
      description: '是否已加载全部数据',
    },
    showScrollbar: {
      control: 'boolean',
      description: '是否常显 CwDiv 滚动条（默认 false）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwWaterfall>

const items: CwWaterfallItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `item-${index}`,
  height: 80 + (index % 3) * 30,
  content: `Item ${index + 1}`,
}))

interface InfiniteWaterfallDemoProps {
  args: CwWaterfallProps
  showScrollbar: boolean
}

function InfiniteWaterfallDemo({
  args,
  showScrollbar,
}: InfiniteWaterfallDemoProps) {
  const [list, setList] = useState<CwWaterfallItem[]>(() => generateItems(10))
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (list.length >= 1000) setFinished(true)
  }, [list.length])

  const loadMore = () => {
    if (finished) return
    setLoading(true)
    window.setTimeout(() => {
      setList((prev) => [...prev, ...generateItems(5)])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="relative h-[100vh] w-[100vw] bg-[var(--bg-color-page)]">
      <CwWaterfall
        {...args}
        items={list}
        loading={loading}
        finished={finished}
        showScrollbar={showScrollbar}
        className="h-full w-full"
        onLoadMore={loadMore}
      >
        {({ item }) => (
          <div className="flex w-full overflow-hidden rounded shadow-md transition-all hover:shadow-lg">
            {item.isVideo ? (
              <CwVideoPlayer
                src={String(item.videoUrl)}
                className="w-full"
                controls={false}
                style={item.height ? { height: `${item.height}px` } : undefined}
              />
            ) : (
              <img
                src={String(item.imageUrl)}
                className="block w-full object-cover"
                alt={String(item.title)}
                style={item.height ? { height: `${item.height}px` } : undefined}
              />
            )}
          </div>
        )}
      </CwWaterfall>
    </div>
  )
}

export const InfiniteScroll: Story = {
  args: {
    items: generateItems(10),
    columnGap: 16,
    rowGap: 16,
    breakpoints: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
    lazyLoad: true,
    infiniteScroll: true,
    loading: false,
    finished: false,
    showScrollbar: false,
  },
  render: (args) => <InfiniteWaterfallDemo args={args} showScrollbar={false} />,
}

export const WithScrollbar: Story = {
  args: {
    ...InfiniteScroll.args,
    showScrollbar: true,
  },
  render: (args) => <InfiniteWaterfallDemo args={args} showScrollbar />,
}

const makeCards = (count: number): CwWaterfallItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `slot-${i}`,
    title: `卡片 ${i + 1}`,
    subtitle: i % 2 === 0 ? '两行说明文字' : '单行',
    height: 88 + (i % 3) * 28,
  }))

const defaultItems = makeCards(6)
const loadingItems = makeCards(4)
const finishedItems = makeCards(4)

const waterfallBase: Omit<CwWaterfallProps, 'items'> = {
  columnGap: 12,
  rowGap: 12,
  columnCount: 3,
  lazyLoad: false,
  infiniteScroll: false,
}

const frameClass =
  'h-[18rem] w-full overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]'

export const WithSlots: Story = {
  parameters: {
    ...withSlotsStoryParameters,
    layout: 'padded',
  },
  render: () => (
    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-8 px-4 py-6">
      <SlotStorySection slot="default">
        <div className={frameClass}>
          <CwWaterfall {...waterfallBase} items={defaultItems} className="h-full">
            {({ item }) => (
              <div
                className="box-border flex w-full flex-col justify-end rounded-md border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-3"
                style={item.height ? { height: `${item.height}px` } : undefined}
              >
                <div className="text-sm font-medium text-[var(--text-color-primary)]">
                  {String(item.title)}
                </div>
                <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
                  {String(item.subtitle)}
                </div>
              </div>
            )}
          </CwWaterfall>
        </div>
      </SlotStorySection>

      <SlotStorySection slot="loading">
        <div className={frameClass}>
          <CwWaterfall
            {...waterfallBase}
            items={loadingItems}
            loading
            className="h-full"
            loadingSlot={
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--text-color-secondary)]">
                <CwLoading type="spinner" size="small" />
                <span>自定义加载中…</span>
              </div>
            }
          >
            {({ item }) => (
              <div
                className="box-border w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-3"
                style={item.height ? { height: `${item.height}px` } : undefined}
              >
                <div className="text-sm text-[var(--text-color-primary)]">
                  {String(item.title)}
                </div>
              </div>
            )}
          </CwWaterfall>
        </div>
      </SlotStorySection>

      <SlotStorySection slot="finished">
        <div className={frameClass}>
          <CwWaterfall
            {...waterfallBase}
            items={finishedItems}
            finished
            className="h-full"
            finishedSlot={
              <div className="py-4 text-center text-sm text-[var(--text-color-placeholder)]">
                自定义：已经到底啦
              </div>
            }
          >
            {({ item }) => (
              <div
                className="box-border w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-3"
                style={item.height ? { height: `${item.height}px` } : undefined}
              >
                <div className="text-sm text-[var(--text-color-primary)]">
                  {String(item.title)}
                </div>
              </div>
            )}
          </CwWaterfall>
        </div>
      </SlotStorySection>

      <SlotStorySection slot="empty">
        <div className="h-[12rem] w-full overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]">
          <CwWaterfall
            {...waterfallBase}
            items={[]}
            className="h-full"
            emptySlot={
              <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-[var(--text-color-secondary)]">
                <span className="font-medium text-[var(--text-color-primary)]">
                  暂无内容
                </span>
                <span className="text-xs text-[var(--text-color-placeholder)]">
                  自定义空状态
                </span>
              </div>
            }
          />
        </div>
      </SlotStorySection>
    </div>
  ),
}
