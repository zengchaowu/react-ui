import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTree } from '.'
import type { TreeProps } from './types'

const meta: Meta<TreeProps> = {
  title: 'At/AtTree',
  component: AtTree,
}
export default meta

type Story = StoryObj<TreeProps>

export const Basic: Story = {
  args: {
    treeData: [
      {
        title: 'Parent 1',
        key: '0-0',
        children: [
          { title: 'Leaf 1', key: '0-0-0' },
          { title: 'Leaf 2', key: '0-0-1' },
        ],
      },
    ],
    defaultExpandAll: true,
  },
}