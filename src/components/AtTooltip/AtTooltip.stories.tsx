import type { Meta, StoryObj } from '@storybook/react'
import { AtTooltip } from './index'

const meta: Meta<typeof AtTooltip> = {
  title: 'Ant Design/AtTooltip',
  component: AtTooltip,
  args: {
    title: '提示文字',
    children: '悬停显示 Tooltip',
  },
}

export default meta
export const Basic: StoryObj<typeof AtTooltip> = {}