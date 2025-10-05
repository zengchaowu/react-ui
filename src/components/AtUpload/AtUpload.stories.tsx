import type { Meta, StoryObj } from '@storybook/react'
import { AtUpload } from './index'

const meta: Meta<typeof AtUpload> = {
  title: 'Ant Design/AtUpload',
  component: AtUpload,
  args: {
    beforeUpload: () => false,
    children: '点击上传',
  },
}

export default meta
export const Basic: StoryObj<typeof AtUpload> = {}