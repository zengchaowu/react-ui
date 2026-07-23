import type { Meta, StoryObj } from '@storybook/react'
import { CwImageFit } from './CwImageFit'

const meta: Meta<typeof CwImageFit> = {
  title: 'Cw/CwImageFit',
  component: CwImageFit,
}

export default meta
type Story = StoryObj<typeof CwImageFit>

export const Default: Story = {
  args: {
    children: 'CwImageFit',
  },
}
