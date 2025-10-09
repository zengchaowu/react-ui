import type { Meta, StoryObj } from '@storybook/react'
import { AtInputNumber } from './index'

const meta: Meta<typeof AtInputNumber> = {
  title: 'At/AtInputNumber',
  component: AtInputNumber,
  args: {
    min: 0,
    max: 100,
    defaultValue: 10,
  },
}

export default meta
export const Basic: StoryObj<typeof AtInputNumber> = {}