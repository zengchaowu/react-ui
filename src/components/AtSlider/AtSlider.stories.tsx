import type { Meta, StoryObj } from '@storybook/react'
import { AtSlider } from './index'

const meta: Meta<typeof AtSlider> = {
  title: 'At/AtSlider',
  component: AtSlider,
  args: {
    defaultValue: 30,
    min: 0,
    max: 100,
    step: 1,
  },
}

export default meta
export const Basic: StoryObj<typeof AtSlider> = {}