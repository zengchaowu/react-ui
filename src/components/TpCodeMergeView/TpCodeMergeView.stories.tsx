import type { Meta, StoryObj } from '@storybook/react'
import { TpCodeMergeView } from './TpCodeMergeView'

const meta: Meta<typeof TpCodeMergeView> = {
  title: '2. Third Party/Editor/TpCodeMergeView',
  component: TpCodeMergeView,
}

export default meta
type Story = StoryObj<typeof TpCodeMergeView>

export const Default: Story = {
  args: {},
}
