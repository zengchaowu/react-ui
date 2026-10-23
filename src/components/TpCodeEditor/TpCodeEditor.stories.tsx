import type { Meta, StoryObj } from '@storybook/react'
import { TpCodeEditor } from './TpCodeEditor'

const meta: Meta<typeof TpCodeEditor> = {
  title: '2. Third Party/Editor/TpCodeEditor',
  component: TpCodeEditor,
}

export default meta
type Story = StoryObj<typeof TpCodeEditor>

export const Default: Story = {
  args: {},
}
