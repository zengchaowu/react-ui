import type { Meta, StoryObj } from '@storybook/react'
import { TpOfficePreview } from './TpOfficePreview'

const meta: Meta<typeof TpOfficePreview> = {
  title: '2. Third Party/File/TpOfficePreview',
  component: TpOfficePreview,
}

export default meta
type Story = StoryObj<typeof TpOfficePreview>

export const Default: Story = {
  args: {},
}
