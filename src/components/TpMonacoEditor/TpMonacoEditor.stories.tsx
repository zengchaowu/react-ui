import type { Meta, StoryObj } from '@storybook/react'
import { TpMonacoEditor } from './TpMonacoEditor'

const meta: Meta<typeof TpMonacoEditor> = {
  title: '2. Third Party/Editor/TpMonacoEditor',
  component: TpMonacoEditor,
}

export default meta
type Story = StoryObj<typeof TpMonacoEditor>

export const Default: Story = {
  args: {},
}
