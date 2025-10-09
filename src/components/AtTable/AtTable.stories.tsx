import type { Meta, StoryObj } from '@storybook/react'
import { AtTable } from './index'

const meta: Meta<typeof AtTable> = {
  title: 'At/AtTable',
  component: AtTable,
  args: {
    rowKey: 'key',
    columns: [
      { title: 'At/AtTable', dataIndex: 'name', key: 'name' },
      { title: 'At/AtTable', dataIndex: 'age', key: 'age' },
    ],
    dataSource: [
      { key: '1', name: '张三', age: 28 },
      { key: '2', name: '李四', age: 24 },
    ],
    pagination: false,
  },
}

export default meta
export const Basic: StoryObj<typeof AtTable> = {}