import type { Meta, StoryObj } from '@storybook/react'
import { CwFunctionGrid } from './CwFunctionGrid'

const meta: Meta<typeof CwFunctionGrid> = {
  title: '1. Components/Display/CwFunctionGrid',
  component: CwFunctionGrid,
}

export default meta
type Story = StoryObj<typeof CwFunctionGrid>

export const Default: Story = {
  args: {
    items: [
      { key: 'order', label: '订单', icon: 'common--action--download-line' },
      { key: 'store', label: '门店', icon: 'common--nav--location-filled' },
      { key: 'stat', label: '统计', icon: 'common--action--share-line' },
      { key: 'setting', label: '设置', icon: 'common--action--upload-line' },
    ],
  },
}
