import type { Meta, StoryObj } from '@storybook/react'
import { TpMonacoEditor } from './TpMonacoEditor'

const meta: Meta<typeof TpMonacoEditor> = {
  title: 'Tp/TpMonacoEditor',
  component: TpMonacoEditor,
}

export default meta
type Story = StoryObj<typeof TpMonacoEditor>

export const Default: Story = {
  args: {
    children: 'TpMonacoEditor',
  },
}
