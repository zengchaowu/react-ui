import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAiChatComposer } from './CwAiChatComposer'

const meta: Meta<typeof CwAiChatComposer> = {
  title: '1. Components/Chat/CwAiChatComposer',
  component: CwAiChatComposer,
  args: {
    layout: 'wide',
    disabled: false,
    sending: false,
    showAttach: true,
    showVoice: true,
    pendingAttachmentCount: 0,
  },
}

export default meta
type Story = StoryObj<typeof CwAiChatComposer>

export const Default: Story = {
  render: (args) => {
    const [draft, setDraft] = useState('')
    return (
      <div className="w-[32.5rem] max-w-full border border-[var(--border-color)] bg-[var(--bg-color-page)] p-4">
        <CwAiChatComposer
          {...args}
          value={draft}
          onChange={setDraft}
          onSubmit={() => setDraft('')}
        />
      </div>
    )
  },
}

export const NarrowLayout: Story = {
  args: {
    layout: 'narrow',
  },
  render: (args) => {
    const [draft, setDraft] = useState('')
    return (
      <div className="w-[32.5rem] max-w-full border border-[var(--border-color)] bg-[var(--bg-color-page)] p-4">
        <CwAiChatComposer
          {...args}
          value={draft}
          onChange={setDraft}
          onSubmit={() => setDraft('')}
        />
      </div>
    )
  },
}
