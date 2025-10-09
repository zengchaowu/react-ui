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
        title: 'At/AtTree',
        key: '0-0',
        children: [
          { title: 'At/AtTree', key: '0-0-0' },
          { title: 'At/AtTree', key: '0-0-1' },
        ],
      },
    ],
    defaultExpandAll: true,
  },
}