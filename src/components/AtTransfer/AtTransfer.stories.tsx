import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTransfer } from '.'
import type { TransferProps } from './types'

const meta: Meta<TransferProps<any>> = {
  title: 'At/AtTransfer',
  component: AtTransfer,
}
export default meta

type Story = StoryObj<TransferProps<any>>

export const Basic: Story = {
  args: {
    dataSource: [
      { key: '1', title: 'Item 1', description: 'Description 1' },
      { key: '2', title: 'Item 2', description: 'Description 2' },
      { key: '3', title: 'Item 3', description: 'Description 3' },
    ],
    titles: ['Source', 'Target'],
    targetKeys: ['2'],
    render: (item) => item.title,
  },
}