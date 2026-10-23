import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { CwNavigationTree } from './CwNavigationTree'
import type { CwNavigationTreeProps, CwTreeNode } from './types'

const navTreeData: CwTreeNode[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: 'common--nav--home-filled',
  },
  {
    key: 'content',
    label: '内容管理',
    icon: 'common--status--info-filled',
    children: [
      { key: 'content-article', label: '文章列表', icon: 'common--nav--file-line' },
      { key: 'content-media', label: '媒体库', icon: 'common--media--image-line' },
    ],
  },
  {
    key: 'system',
    label: '系统设置',
    icon: 'common--nav--settings-line',
    children: [
      { key: 'system-user', label: '用户管理', icon: 'common--user--user-filled' },
      { key: 'system-role', label: '角色权限', icon: 'common--commerce--coupon-line' },
    ],
  },
]

const meta: Meta<typeof CwNavigationTree> = {
  title: '1. Components/Navigation/CwNavigationTree',
  component: CwNavigationTree,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwNavigationTree 是侧栏导航树组件，基于 CwTree 封装，适用于后台/管理端侧边栏菜单。支持节点图标、右侧展开箭头、选中高亮。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    treeData: {
      control: { type: 'object' },
      description: '树形导航数据',
    },
    selectedKeys: {
      control: { type: 'object' },
      description: '受控的选中节点 key 数组',
    },
    expandedKeys: {
      control: { type: 'object' },
      description: '受控的展开节点 key 数组',
    },
    appearance: {
      control: { type: 'select' },
      options: ['admin', 'cloudDisk'],
      description: '侧栏导航场景外观',
    },
    onUpdateSelectedKeys: { action: 'update:selectedKeys' },
    onUpdateExpandedKeys: { action: 'update:expandedKeys' },
    onNodeSelect: { action: 'node-select' },
  },
}

export default meta
type Story = StoryObj<typeof CwNavigationTree>

/** 受控选中/展开，交互等价 Vue 的 v-model:selected-keys / v-model:expanded-keys */
function ControlledNavigationTree({
  selectedKeys: selectedKeysArg,
  expandedKeys: expandedKeysArg,
  ...props
}: CwNavigationTreeProps) {
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(
    selectedKeysArg ?? [],
  )
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(
    expandedKeysArg ?? [],
  )

  useEffect(() => {
    if (selectedKeysArg) setSelectedKeys([...selectedKeysArg])
  }, [selectedKeysArg])

  useEffect(() => {
    if (expandedKeysArg) setExpandedKeys([...expandedKeysArg])
  }, [expandedKeysArg])

  return (
    <div className="w-64 border border-[var(--border-color)] rounded-md p-2">
      <CwNavigationTree
        {...props}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        onUpdateSelectedKeys={setSelectedKeys}
        onUpdateExpandedKeys={setExpandedKeys}
      />
    </div>
  )
}

export const Default: Story = {
  args: {
    treeData: navTreeData,
    selectedKeys: ['dashboard'],
    expandedKeys: ['content', 'system'],
    appearance: 'admin',
  },
  render: (args) => <ControlledNavigationTree {...args} />,
}
