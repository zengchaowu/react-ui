import type { Meta, StoryObj } from '@storybook/react'
import { CwImageFit } from './CwImageFit'

const meta: Meta<typeof CwImageFit> = {
  title: '1. Components/Media/CwImageFit',
  component: CwImageFit,
}

export default meta
type Story = StoryObj<typeof CwImageFit>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/640/480',
    alt: '示例图片',
  },
  render: (args) => (
    <div style={{ width: 320, height: 240 }}>
      <CwImageFit {...args} />
    </div>
  ),
}

export const BoundedInlineChip: Story = {
  args: {
    src: 'https://picsum.photos/640/480',
    alt: '行内图片',
    appearance: 'inline-chip',
    boundsMaxWidth: 80,
    boundsMaxHeight: 40,
    boundsMinHeight: 20,
    intrinsicWidth: 640,
    intrinsicHeight: 480,
  },
}
