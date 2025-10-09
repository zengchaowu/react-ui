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
      { key: '1', title: 'At/AtTransfer', description: 'Description 1' },
      { key: '2', title: 'At/AtTransfer', description: 'Description 2' },
      { key: '3', title: 'At/AtTransfer', description: 'Description 3' },
    ],
    titles: ['Source', 'Target'],
    targetKeys: ['2'],
    render: (item) => item.title,
  },
}