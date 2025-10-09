import type { Meta, StoryObj } from '@storybook/react'
import { AtResult } from './index'

const meta: Meta<typeof AtResult> = {
  title: 'At/AtResult',
  component: AtResult,
  args: {
    status: 'success',
    title: 'At/AtResult',
    subTitle: 'Order number: 2017182818828182881',
  },
}

export default meta
export const Basic: StoryObj<typeof AtResult> = {}