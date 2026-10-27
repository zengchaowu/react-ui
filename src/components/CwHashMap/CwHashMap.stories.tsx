import type { Meta, StoryObj } from '@storybook/react'
import { CwHashMap } from './CwHashMap'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwHashMap/texts'
import type { CwHashMapBucket, CwHashMapProps } from './types'

const meta: Meta<typeof CwHashMap> = {
  title: '1. Components/Visualization/CwHashMap',
  component: CwHashMap,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'HashMap（哈希表）数据结构可视化组件，展示桶数组和链表结构。支持显示哈希值、索引，适合教学和算法可视化。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    buckets: {
      control: { type: 'object' },
      description: '哈希表的桶数组',
    },
    bucketWidth: {
      control: { type: 'number' },
      description: '桶的宽度（像素）',
    },
    bucketHeight: {
      control: { type: 'number' },
      description: '桶的高度（像素）',
    },
    entryWidth: {
      control: { type: 'number' },
      description: '条目的宽度（像素）',
    },
    entryHeight: {
      control: { type: 'number' },
      description: '条目的高度（像素）',
    },
    entryGap: {
      control: { type: 'number' },
      description: '条目之间的间距（像素）',
    },
    showHash: {
      control: { type: 'boolean' },
      description: '是否显示哈希值',
    },
    showIndex: {
      control: { type: 'boolean' },
      description: '是否显示索引',
    },
    onBucketClick: { action: 'bucket-click' },
    onEntryClick: { action: 'entry-click' },
  },
}

export default meta
type Story = StoryObj<typeof CwHashMap>

// 简单示例
const simpleBuckets: CwHashMapBucket[] = [
  { index: 0, entries: [{ key: 'apple', value: 100, hash: 0 }] },
  { index: 1, entries: [] },
  { index: 2, entries: [{ key: 'banana', value: 200, hash: 2 }] },
  { index: 3, entries: [{ key: 'cherry', value: 300, hash: 3 }] },
  { index: 4, entries: [] },
]

// 有哈希冲突的示例
const collisionBuckets: CwHashMapBucket[] = [
  { index: 0, entries: [] },
  {
    index: 1,
    entries: [
      { key: 'cat', value: 'meow', hash: 1 },
      { key: 'dog', value: 'woof', hash: 1 },
      { key: 'bird', value: 'tweet', hash: 1 },
    ],
  },
  { index: 2, entries: [{ key: 'fish', value: 'bubble', hash: 2 }] },
  {
    index: 3,
    entries: [
      { key: 'lion', value: 'roar', hash: 3 },
      { key: 'tiger', value: 'growl', hash: 3 },
    ],
  },
  { index: 4, entries: [] },
]

// 用户信息示例
const userBuckets: CwHashMapBucket[] = [
  {
    index: 0,
    entries: [{ key: 'user_1001', value: 'Alice', hash: 0 }],
  },
  { index: 1, entries: [] },
  {
    index: 2,
    entries: [
      { key: 'user_1002', value: 'Bob', hash: 2 },
      { key: 'user_1009', value: 'Charlie', hash: 2 },
    ],
  },
  {
    index: 3,
    entries: [{ key: 'user_1003', value: 'David', hash: 3 }],
  },
  { index: 4, entries: [] },
  {
    index: 5,
    entries: [
      { key: 'user_1005', value: 'Eve', hash: 5 },
      { key: 'user_1012', value: 'Frank', hash: 5 },
    ],
  },
  { index: 6, entries: [] },
  {
    index: 7,
    entries: [{ key: 'user_1007', value: 'Grace', hash: 7 }],
  },
]

// 缓存系统示例
const cacheBuckets: CwHashMapBucket[] = [
  {
    index: 0,
    entries: [{ key: '/api/users', value: 'cached', hash: 0 }],
  },
  {
    index: 1,
    entries: [
      { key: '/api/posts', value: 'cached', hash: 1 },
      { key: '/api/comments', value: 'cached', hash: 1 },
    ],
  },
  { index: 2, entries: [] },
  {
    index: 3,
    entries: [{ key: '/api/profile', value: 'cached', hash: 3 }],
  },
]

// 空哈希表
const emptyBuckets: CwHashMapBucket[] = [
  { index: 0, entries: [] },
  { index: 1, entries: [] },
  { index: 2, entries: [] },
  { index: 3, entries: [] },
  { index: 4, entries: [] },
]

function HashMapDemo({ args, description }: { args: CwHashMapProps; description: string }) {
  return (
    <div>
      <div className="mb-4 text-sm text-[var(--text-color-secondary)]">{description}</div>
      <CwHashMap {...args} />
    </div>
  )
}

export const Default: Story = {
  args: {
    texts: defaultTexts,
    buckets: simpleBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 100,
    entryHeight: 60,
    entryGap: 20,
    showHash: false,
    showIndex: true,
  },
  render: (args) => <HashMapDemo args={args} description="简单的 HashMap 示例" />,
}

export const WithCollisions: Story = {
  args: {
    texts: defaultTexts,
    buckets: collisionBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 100,
    entryHeight: 70,
    entryGap: 20,
    showHash: true,
    showIndex: true,
  },
  render: (args) => (
    <HashMapDemo args={args} description="展示哈希冲突：多个键映射到同一个桶，使用链表解决冲突" />
  ),
}

export const UserDatabase: Story = {
  args: {
    texts: defaultTexts,
    buckets: userBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 120,
    entryHeight: 60,
    entryGap: 20,
    showHash: false,
    showIndex: true,
  },
  render: (args) => (
    <HashMapDemo args={args} description="用户数据库场景：使用 HashMap 快速查找用户信息" />
  ),
}

export const CacheSystem: Story = {
  args: {
    texts: defaultTexts,
    buckets: cacheBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 140,
    entryHeight: 60,
    entryGap: 20,
    showHash: false,
    showIndex: true,
  },
  render: (args) => (
    <HashMapDemo args={args} description="缓存系统：使用 HashMap 存储 API 响应缓存" />
  ),
}

export const EmptyHashMap: Story = {
  args: {
    texts: defaultTexts,
    buckets: emptyBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 100,
    entryHeight: 60,
    entryGap: 20,
    showHash: false,
    showIndex: true,
  },
  render: (args) => <HashMapDemo args={args} description="空的 HashMap：初始状态" />,
}

export const WithoutIndex: Story = {
  args: {
    texts: defaultTexts,
    buckets: collisionBuckets,
    bucketWidth: 60,
    bucketHeight: 40,
    entryWidth: 100,
    entryHeight: 70,
    entryGap: 20,
    showHash: true,
    showIndex: false,
  },
  render: (args) => <HashMapDemo args={args} description="隐藏索引显示" />,
}

export const CustomStyling: Story = {
  args: {
    texts: defaultTexts,
    buckets: collisionBuckets,
    bucketWidth: 70,
    bucketHeight: 45,
    entryWidth: 110,
    entryHeight: 70,
    entryGap: 25,
    showHash: true,
    showIndex: true,
    bucketClass:
      'rounded-lg border-2 border-[var(--brand-color-focus)] bg-[color-mix(in_srgb,var(--brand-color-6)_10%,transparent)] shadow-sm hover:shadow-md',
    entryClass:
      'rounded-lg border-2 border-[var(--success-color-focus)] bg-[color-mix(in_srgb,var(--success-color-6)_10%,transparent)] shadow-sm hover:shadow-md',
    textClass: 'text-[var(--success-color-active)]',
    indexClass: 'text-[var(--brand-color-6)]',
    emptyBucketClass:
      'rounded-lg border-2 border-dashed border-[var(--brand-color-focus)] bg-[color-mix(in_srgb,var(--brand-color-6)_8%,transparent)] shadow-sm',
    lineClass: 'stroke-[var(--brand-color-focus)]',
  },
  render: (args) => <HashMapDemo args={args} description="自定义样式：紫绿配色主题" />,
}
