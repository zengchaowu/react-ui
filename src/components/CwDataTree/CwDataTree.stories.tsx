import type { Meta, StoryObj } from '@storybook/react'
import { CwDataTree } from './CwDataTree'
import type { CwDataTreeNode } from './types'

const meta: Meta<typeof CwDataTree> = {
  title: '1. Components/Visualization/CwDataTree',
  component: CwDataTree,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '纵向树形图组件（数据结构书风格），从上到下展示层级关系。组件只负责布局，外观通过 nodeClass、textClass、lineClass、buttonClass 控制。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: { type: 'object' }, description: '树形数据' },
    defaultExpandAll: { control: { type: 'boolean' }, description: '是否默认展开所有节点' },
    nodeWidth: { control: { type: 'number' }, description: '节点宽度（像素）' },
    nodeHeight: { control: { type: 'number' }, description: '节点高度（像素）' },
    levelGap: { control: { type: 'number' }, description: '层级间距（像素）' },
    siblingGap: { control: { type: 'number' }, description: '同级节点间距（像素）' },
    showConnector: { control: { type: 'boolean' }, description: '是否显示连接线' },
    connectorStyle: {
      control: { type: 'select' },
      options: ['straight', 'bezier', 'step'],
      description: '连接线样式',
    },
    nodeClass: { control: { type: 'text' }, description: '节点样式类名' },
    textClass: { control: { type: 'text' }, description: '文字样式类名' },
    lineClass: { control: { type: 'text' }, description: '连接线样式类名' },
    buttonClass: { control: { type: 'text' }, description: '按钮样式类名' },
    onNodeClick: { action: 'node-click' },
    onNodeExpand: { action: 'node-expand' },
    onNodeCollapse: { action: 'node-collapse' },
  },
}

export default meta
type Story = StoryObj<typeof CwDataTree>

// 二叉树示例
const binaryTreeData: CwDataTreeNode[] = [
  {
    id: '1',
    label: '根节点',
    children: [
      {
        id: '2',
        label: '左子树',
        children: [
          { id: '4', label: '节点4' },
          { id: '5', label: '节点5' },
        ],
      },
      {
        id: '3',
        label: '右子树',
        children: [
          { id: '6', label: '节点6' },
          { id: '7', label: '节点7' },
        ],
      },
    ],
  },
]

export const Default: Story = {
  args: {
    data: binaryTreeData,
    defaultExpandAll: true,
    nodeHeight: 50,
    levelGap: 70,
    siblingGap: 20,
    showConnector: true,
    connectorStyle: 'straight',
  },
  render: (args) => <CwDataTree {...args} />,
}
