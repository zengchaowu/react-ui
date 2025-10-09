import type { Meta, StoryObj } from '@storybook/react'
import { AtBackTop } from './index'

const meta: Meta<typeof AtBackTop> = {
  title: 'At/AtBackTop',
  component: AtBackTop,
  args: {
    children: '返回顶部',
    visibilityHeight: 100,
  },
}

export default meta
export const Basic: StoryObj<typeof AtBackTop> = {}