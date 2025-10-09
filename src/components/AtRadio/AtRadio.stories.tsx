import type { Meta, StoryObj } from '@storybook/react'
import { AtRadio } from './index'

const meta: Meta<typeof AtRadio> = {
  title: 'At/AtRadio',
  component: AtRadio,
  args: {
    children: '选项',
    defaultChecked: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtRadio> = {}