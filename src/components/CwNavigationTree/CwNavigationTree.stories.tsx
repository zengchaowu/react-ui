import type { Meta, StoryObj } from '@storybook/react'
import { CwNavigationTree } from './CwNavigationTree'
import type { CwTreeNode } from './types'

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
}

export default meta
type Story = StoryObj<typeof CwNavigationTree>

export const Default: Story = {
  args: {
    treeData: navTreeData,
    selectedKeys: ['dashboard'],
    expandedKeys: ['content', 'system'],
    appearance: 'admin',
    className: 'w-64',
  },
}
