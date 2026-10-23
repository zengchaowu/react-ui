import type { Meta, StoryObj } from '@storybook/react'
import { CwGraph } from './CwGraph'
import type { CwGraphEdge, CwGraphNode } from './types'

const meta: Meta<typeof CwGraph> = {
  title: '1. Components/Visualization/CwGraph',
  component: CwGraph,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '图数据结构可视化组件，支持有向图和无向图，自动力导向布局，支持节点拖拽和自定义样式。组件会根据内容自动计算所需的宽高。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    nodes: {
      control: { type: 'object' },
      description: '图的节点数组',
    },
    edges: {
      control: { type: 'object' },
      description: '图的边数组',
    },
    nodeWidth: {
      control: { type: 'number' },
      description: '节点宽度（像素）',
    },
    nodeHeight: {
      control: { type: 'number' },
      description: '节点高度（像素）',
    },
    directed: {
      control: { type: 'boolean' },
      description: '是否为有向图',
    },
    showEdgeLabel: {
      control: { type: 'boolean' },
      description: '是否显示边的标签',
    },
    showEdgeWeight: {
      control: { type: 'boolean' },
      description: '是否显示边的权重',
    },
    autoLayout: {
      control: { type: 'boolean' },
      description: '是否自动布局',
    },
    layoutIterations: {
      control: { type: 'number' },
      description: '布局迭代次数',
    },
    nodeClass: {
      control: { type: 'text' },
      description: '节点样式类名',
    },
    textClass: {
      control: { type: 'text' },
      description: '文字样式类名',
    },
    edgeClass: {
      control: { type: 'text' },
      description: '边样式类名',
    },
    onNodeClick: { action: 'node-click' },
    onEdgeClick: { action: 'edge-click' },
    onNodeDrag: { action: 'node-drag' },
    onNodeDragEnd: { action: 'node-drag-end' },
  },
}

export default meta
type Story = StoryObj<typeof CwGraph>

// 简单无向图
const simpleGraphNodes: CwGraphNode[] = [
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'D', label: 'D' },
]

const simpleGraphEdges: CwGraphEdge[] = [
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
  { source: 'C', target: 'D' },
  { source: 'D', target: 'A' },
  { source: 'A', target: 'C' },
]

// 有向图（带权重）
const directedGraphNodes: CwGraphNode[] = [
  { id: '1', label: '北京' },
  { id: '2', label: '上海' },
  { id: '3', label: '广州' },
  { id: '4', label: '深圳' },
  { id: '5', label: '杭州' },
]

const directedGraphEdges: CwGraphEdge[] = [
  { source: '1', target: '2', weight: 1200, label: '高铁' },
  { source: '2', target: '3', weight: 1500, label: '高铁' },
  { source: '3', target: '4', weight: 150, label: '地铁' },
  { source: '2', target: '5', weight: 180, label: '高铁' },
  { source: '5', target: '4', weight: 800, label: '高铁' },
]

// 社交网络图
const socialNetworkNodes: CwGraphNode[] = [
  { id: 'alice', label: 'Alice' },
  { id: 'bob', label: 'Bob' },
  { id: 'charlie', label: 'Charlie' },
  { id: 'david', label: 'David' },
  { id: 'eve', label: 'Eve' },
  { id: 'frank', label: 'Frank' },
]

const socialNetworkEdges: CwGraphEdge[] = [
  { source: 'alice', target: 'bob', label: '好友' },
  { source: 'alice', target: 'charlie', label: '好友' },
  { source: 'bob', target: 'david', label: '好友' },
  { source: 'charlie', target: 'david', label: '好友' },
  { source: 'charlie', target: 'eve', label: '好友' },
  { source: 'david', target: 'frank', label: '好友' },
  { source: 'eve', target: 'frank', label: '好友' },
  { source: 'alice', target: 'eve', label: '好友' },
]

// 数据流图
const dataFlowNodes: CwGraphNode[] = [
  { id: 'input', label: '输入' },
  { id: 'process1', label: '处理1' },
  { id: 'process2', label: '处理2' },
  { id: 'merge', label: '合并' },
  { id: 'output', label: '输出' },
]

const dataFlowEdges: CwGraphEdge[] = [
  { source: 'input', target: 'process1', directed: true },
  { source: 'input', target: 'process2', directed: true },
  { source: 'process1', target: 'merge', directed: true },
  { source: 'process2', target: 'merge', directed: true },
  { source: 'merge', target: 'output', directed: true },
]

export const Default: Story = {
  args: {
    nodes: simpleGraphNodes,
    edges: simpleGraphEdges,
    nodeWidth: 80,
    nodeHeight: 50,
    directed: false,
    showEdgeLabel: false,
    showEdgeWeight: false,
    autoLayout: true,
    layoutIterations: 100,
  },
  render: (args) => <CwGraph {...args} />,
}

export const DirectedGraph: Story = {
  args: {
    nodes: directedGraphNodes,
    edges: directedGraphEdges,
    nodeWidth: 80,
    nodeHeight: 50,
    directed: true,
    showEdgeLabel: true,
    showEdgeWeight: true,
    autoLayout: true,
    layoutIterations: 100,
    nodeClass:
      'rounded-lg border-2 border-[var(--success-color-6)] bg-[color-mix(in_srgb,var(--success-color-6)_10%,transparent)] shadow-sm transition-shadow hover:shadow-md',
    edgeClass: 'stroke-[var(--success-color-6)]',
    arrowClass: 'fill-[var(--success-color-6)]',
  },
  render: (args) => <CwGraph {...args} />,
}

export const SocialNetwork: Story = {
  args: {
    nodes: socialNetworkNodes,
    edges: socialNetworkEdges,
    nodeWidth: 80,
    nodeHeight: 50,
    directed: false,
    showEdgeLabel: true,
    showEdgeWeight: false,
    autoLayout: true,
    layoutIterations: 120,
    nodeClass:
      'rounded-full border-2 border-[var(--brand-color-focus)] bg-[color-mix(in_srgb,var(--brand-color-6)_10%,transparent)] shadow-sm transition-shadow hover:shadow-md',
    textClass: 'text-sm font-semibold text-[var(--brand-color-6)]',
    edgeClass: 'stroke-[var(--brand-color-focus)]',
    edgeLabelClass: 'text-[var(--brand-color-6)]',
  },
  render: (args) => <CwGraph {...args} />,
}

export const DataFlow: Story = {
  args: {
    nodes: dataFlowNodes,
    edges: dataFlowEdges,
    nodeWidth: 100,
    nodeHeight: 60,
    directed: true,
    showEdgeLabel: false,
    showEdgeWeight: false,
    autoLayout: true,
    layoutIterations: 100,
    nodeClass:
      'bg-[var(--button-brand-tint-hover-bg)] border-2 border-[var(--brand-color-6)] rounded shadow-md hover:shadow-lg transition-shadow',
    textClass: 'text-sm text-[var(--brand-color-6)] font-bold',
    edgeClass: 'stroke-[var(--brand-color-6)]',
    arrowClass: 'fill-[var(--brand-color-6)]',
  },
  render: (args) => <CwGraph {...args} />,
}

export const CustomPositions: Story = {
  args: {
    nodes: [
      { id: '1', label: '节点1', x: 200, y: 150 },
      { id: '2', label: '节点2', x: 600, y: 150 },
      { id: '3', label: '节点3', x: 200, y: 450 },
      { id: '4', label: '节点4', x: 600, y: 450 },
      { id: '5', label: '中心', x: 400, y: 300 },
    ],
    edges: [
      { source: '1', target: '5' },
      { source: '2', target: '5' },
      { source: '3', target: '5' },
      { source: '4', target: '5' },
    ],
    nodeWidth: 80,
    nodeHeight: 50,
    directed: false,
    showEdgeLabel: false,
    showEdgeWeight: false,
    autoLayout: false,
    nodeClass:
      'rounded-lg border-2 border-[var(--warning-color-6)] bg-[color-mix(in_srgb,var(--warning-color-6)_10%,transparent)] shadow-sm hover:shadow-md transition-shadow',
    edgeClass: 'stroke-[var(--warning-color-6)]',
  },
  render: (args) => <CwGraph {...args} />,
}
