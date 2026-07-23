import type { Meta, StoryObj } from '@storybook/react'
import { PageLoginMobile } from './PageLoginMobile'

const meta: Meta<typeof PageLoginMobile> = {
  title: 'Page/PageLoginMobile',
  component: PageLoginMobile,
}

export default meta
type Story = StoryObj<typeof PageLoginMobile>

export const Default: Story = {
  args: {
    children: 'PageLoginMobile',
  },
}
