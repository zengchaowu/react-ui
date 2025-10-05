import type { Meta, StoryObj } from '@storybook/react'
import { AtImage } from './index'

const meta: Meta<typeof AtImage> = {
  title: 'Ant Design/AtImage',
  component: AtImage,
  args: {
    width: 200,
    src: 'https://via.placeholder.com/200x120',
  },
}

export default meta
export const Basic: StoryObj<typeof AtImage> = {}