import type { Meta, StoryObj } from '@storybook/react'
import { PageLogin } from './PageLogin'

const meta: Meta<typeof PageLogin> = {
  title: 'Page/PageLogin',
  component: PageLogin,
}

export default meta
type Story = StoryObj<typeof PageLogin>

export const Default: Story = {
  args: {
    children: 'PageLogin',
  },
}
