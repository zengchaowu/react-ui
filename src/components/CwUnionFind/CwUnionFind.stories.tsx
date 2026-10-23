import type { Meta, StoryObj } from '@storybook/react'
import { CwUnionFind } from './CwUnionFind'
import { defaultTexts } from './texts'
import type { CwUnionFindElement, CwUnionFindProps } from './types'

const meta: Meta<typeof CwUnionFind> = {
  title: '1. Components/Visualization/CwUnionFind',
  component: CwUnionFind,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '并查集（Union-Find）数据结构可视化组件，展示元素的集合关系和树形结构。支持显示秩（rank）和大小（size），自动为不同集合分配颜色。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    elements: {
      control: { type: 'object' },
      description: '并查集的元素数组',
    },
    nodeWidth: {
      control: { type: 'number' },
      description: '节点宽度（像素）',
    },
    nodeHeight: {
      control: { type: 'number' },
      description: '节点高度（像素）',
    },
    levelGap: {
      control: { type: 'number' },
      description: '层级间距（像素）',
    },
    siblingGap: {
      control: { type: 'number' },
      description: '兄弟节点间距（像素）',
    },
    showRank: {
      control: { type: 'boolean' },
      description: '是否显示秩',
    },
    showSize: {
      control: { type: 'boolean' },
      description: '是否显示集合大小',
    },
    autoColorSets: {
      control: { type: 'boolean' },
      description: '是否自动为集合分配颜色',
    },
    nodeClass: {
      control: { type: 'text' },
      description: '普通节点样式类名',
    },
    rootNodeClass: {
      control: { type: 'text' },
      description: '根节点样式类名',
    },
    onNodeClick: { action: 'node-click' },
    onSetClick: { action: 'set-click' },
  },
}

export default meta
type Story = StoryObj<typeof CwUnionFind>

// 初始状态：每个元素都是独立的集合
const initialElements: CwUnionFindElement[] = [
  { id: 1, label: '1', rank: 0, size: 1 },
  { id: 2, label: '2', rank: 0, size: 1 },
  { id: 3, label: '3', rank: 0, size: 1 },
  { id: 4, label: '4', rank: 0, size: 1 },
  { id: 5, label: '5', rank: 0, size: 1 },
  { id: 6, label: '6', rank: 0, size: 1 },
]

// 进行了几次 union 操作后
const afterUnionElements: CwUnionFindElement[] = [
  { id: 1, label: '1', rank: 1, size: 3 },
  { id: 2, label: '2', parent: 1, rank: 0 },
  { id: 3, label: '3', parent: 1, rank: 0 },
  { id: 4, label: '4', rank: 1, size: 2 },
  { id: 5, label: '5', parent: 4, rank: 0 },
  { id: 6, label: '6', rank: 0, size: 1 },
]

// 更复杂的树结构
const complexElements: CwUnionFindElement[] = [
  { id: 1, label: '1', rank: 2, size: 6 },
  { id: 2, label: '2', parent: 1, rank: 1 },
  { id: 3, label: '3', parent: 1, rank: 0 },
  { id: 4, label: '4', parent: 2, rank: 0 },
  { id: 5, label: '5', parent: 2, rank: 0 },
  { id: 6, label: '6', parent: 1, rank: 0 },
]

// 多个集合
const multipleSetElements: CwUnionFindElement[] = [
  { id: 'A', label: 'A', rank: 2, size: 4 },
  { id: 'B', label: 'B', parent: 'A', rank: 1 },
  { id: 'C', label: 'C', parent: 'A', rank: 0 },
  { id: 'D', label: 'D', parent: 'B', rank: 0 },

  { id: 'E', label: 'E', rank: 1, size: 3 },
  { id: 'F', label: 'F', parent: 'E', rank: 0 },
  { id: 'G', label: 'G', parent: 'E', rank: 0 },

  { id: 'H', label: 'H', rank: 1, size: 2 },
  { id: 'I', label: 'I', parent: 'H', rank: 0 },
]

// 朋友圈示例
const friendCircleElements: CwUnionFindElement[] = [
  { id: 'alice', label: 'Alice', rank: 2, size: 5 },
  { id: 'bob', label: 'Bob', parent: 'alice', rank: 1 },
  { id: 'charlie', label: 'Charlie', parent: 'alice', rank: 0 },
  { id: 'david', label: 'David', parent: 'bob', rank: 0 },
  { id: 'eve', label: 'Eve', parent: 'bob', rank: 0 },

  { id: 'frank', label: 'Frank', rank: 1, size: 3 },
  { id: 'grace', label: 'Grace', parent: 'frank', rank: 0 },
  { id: 'henry', label: 'Henry', parent: 'frank', rank: 0 },
]

// 网络连通性示例
const networkElements: CwUnionFindElement[] = [
  { id: 'server1', label: '服务器1', rank: 2, size: 6 },
  { id: 'server2', label: '服务器2', parent: 'server1', rank: 1 },
  { id: 'server3', label: '服务器3', parent: 'server1', rank: 0 },
  { id: 'pc1', label: 'PC1', parent: 'server2', rank: 0 },
  { id: 'pc2', label: 'PC2', parent: 'server2', rank: 0 },
  { id: 'pc3', label: 'PC3', parent: 'server1', rank: 0 },

  { id: 'router1', label: '路由器1', rank: 0, size: 1 },
]

function UnionFindDemo({
  args,
  description,
}: {
  args: CwUnionFindProps
  description: string
}) {
  return (
    <div>
      <div className="mb-4 text-sm text-[var(--text-color-secondary)]">{description}</div>
      <CwUnionFind {...args} />
    </div>
  )
}

export const Default: Story = {
  args: {
    elements: initialElements,
  },
}

export const InitialState: Story = {
  args: {
    texts: defaultTexts,
    elements: initialElements,
    nodeWidth: 80,
    nodeHeight: 50,
    levelGap: 80,
    siblingGap: 20,
    showRank: true,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => <UnionFindDemo args={args} description="初始状态：每个元素都是独立的集合" />,
}

export const AfterUnion: Story = {
  args: {
    texts: defaultTexts,
    elements: afterUnionElements,
    nodeWidth: 80,
    nodeHeight: 50,
    levelGap: 80,
    siblingGap: 20,
    showRank: true,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => (
    <UnionFindDemo args={args} description="执行 union(1, 2), union(1, 3), union(4, 5) 后的状态" />
  ),
}

export const ComplexTree: Story = {
  args: {
    texts: defaultTexts,
    elements: complexElements,
    nodeWidth: 80,
    nodeHeight: 50,
    levelGap: 80,
    siblingGap: 20,
    showRank: true,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => <UnionFindDemo args={args} description="复杂树结构：多层级的并查集" />,
}

export const MultipleSets: Story = {
  args: {
    texts: defaultTexts,
    elements: multipleSetElements,
    nodeWidth: 80,
    nodeHeight: 50,
    levelGap: 80,
    siblingGap: 20,
    showRank: true,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => <UnionFindDemo args={args} description="多个独立集合，自动分配颜色区分" />,
}

export const FriendCircles: Story = {
  args: {
    texts: defaultTexts,
    elements: friendCircleElements,
    nodeWidth: 90,
    nodeHeight: 55,
    levelGap: 80,
    siblingGap: 25,
    showRank: false,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => (
    <UnionFindDemo args={args} description="朋友圈问题：通过并查集判断两个人是否在同一个朋友圈" />
  ),
}

export const NetworkConnectivity: Story = {
  args: {
    texts: defaultTexts,
    elements: networkElements,
    nodeWidth: 100,
    nodeHeight: 55,
    levelGap: 80,
    siblingGap: 25,
    showRank: false,
    showSize: true,
    autoColorSets: true,
  },
  render: (args) => (
    <UnionFindDemo args={args} description="网络连通性：使用并查集表示网络设备的连通关系" />
  ),
}

export const WithoutAutoColor: Story = {
  args: {
    texts: defaultTexts,
    elements: multipleSetElements,
    nodeWidth: 80,
    nodeHeight: 50,
    levelGap: 80,
    siblingGap: 20,
    showRank: true,
    showSize: true,
    autoColorSets: false,
  },
  render: (args) => (
    <UnionFindDemo args={args} description="关闭自动着色：所有集合使用相同颜色" />
  ),
}
