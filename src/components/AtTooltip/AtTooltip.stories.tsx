import type { Meta, StoryObj } from '@storybook/react'
import { AtTooltip } from './index'

const meta: Meta<typeof AtTooltip> = {
  title: 'At/AtTooltip',
  component: AtTooltip,
  args: {
    title: 'At/AtTooltip',
    children: '悬停显示 Tooltip',
  },
}

export default meta
export const Basic: StoryObj<typeof AtTooltip> = {}