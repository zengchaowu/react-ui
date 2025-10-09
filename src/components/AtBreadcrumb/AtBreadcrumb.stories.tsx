import type { Meta, StoryObj } from '@storybook/react'
import { AtBreadcrumb } from './index'

const meta: Meta<typeof AtBreadcrumb> = {
  title: 'At/AtBreadcrumb',
  component: AtBreadcrumb,
  args: {
    items: [
      { title: 'At/AtBreadcrumb', },
      { title: 'At/AtBreadcrumb', },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtBreadcrumb> = {}