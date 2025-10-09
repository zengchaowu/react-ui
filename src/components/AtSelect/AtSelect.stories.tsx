import type { Meta, StoryObj } from '@storybook/react'
import { AtSelect } from './index'

const meta: Meta<typeof AtSelect> = {
  title: 'At/AtSelect',
  component: AtSelect,
  args: {
    options: [
      { label: '苹果', value: 'apple' },
      { label: '香蕉', value: 'banana' },
      { label: '西瓜', value: 'watermelon' },
    ],
    defaultValue: 'apple',
    style: { width: 160 },
  },
}

export default meta
export const Basic: StoryObj<typeof AtSelect> = {}