import type { Meta, StoryObj } from '@storybook/react'
import { CwDesignEditorShell } from './CwDesignEditorShell'

const meta: Meta<typeof CwDesignEditorShell> = {
  title: '1. Components/Layout/CwDesignEditorShell',
  component: CwDesignEditorShell,
}

export default meta
type Story = StoryObj<typeof CwDesignEditorShell>

export const Default: Story = {
  args: {},
}
