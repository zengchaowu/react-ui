import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTreeSelect } from '.'
import type { TreeSelectProps } from './types'

const meta: Meta<TreeSelectProps> = {
  title: 'At/AtTreeSelect',
  component: AtTreeSelect,
}
export default meta

type Story = StoryObj<TreeSelectProps>

export const Basic: Story = {
  args: {
    style: { width: 240 },
    treeData: [
      {
        title: 'At/AtTreeSelect',
        value: '0-0',
        children: [
          { title: 'At/AtTreeSelect', value: '0-0-1' },
          { title: 'At/AtTreeSelect', value: '0-0-2' },
        ],
      },
    ],
    placeholder: 'Please select',
    allowClear: true,
  },
}