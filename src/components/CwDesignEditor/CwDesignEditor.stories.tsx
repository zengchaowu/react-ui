import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignEditor } from './CwDesignEditor'

const meta: Meta<typeof CwDesignEditor> = {
  title: '1. Components/Editor/CwDesignEditor',
  component: CwDesignEditor,
}

export default meta
type Story = StoryObj<typeof CwDesignEditor>

export const Default: Story = {
  args: {},
}
