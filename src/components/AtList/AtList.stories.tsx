import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtList } from '.'
import type { ListProps } from './types'

const meta: Meta<ListProps<any>> = {
  title: 'At/AtList',
  component: AtList,
}
export default meta

type Story = StoryObj<ListProps<any>>

export const Basic: Story = {
  args: {
    bordered: true,
    dataSource: ['Item 1', 'Item 2', 'Item 3'],
    renderItem: (item: string) => <div style={{ padding: 8 }}>{item}</div>,
  },
}