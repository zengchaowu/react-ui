import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwMessageInputMentionPanel } from './CwMessageInputMentionPanel'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'

const fallbackAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" fill="%23d9d9d9"/></svg>'

const items: CwMessageInputMentionItem[] = [
  { id: 'u1', label: 'Alice' },
  { id: 'u2', label: 'Bob' },
  { id: 'u3', label: 'Carol' },
]

const meta: Meta<typeof CwMessageInputMentionPanel> = {
  title: '1. Components/Chat/CwMessageInputMentionPanel',
  component: CwMessageInputMentionPanel,
}

export default meta
type Story = StoryObj<typeof CwMessageInputMentionPanel>

export const Default: Story = {
  render: () => {
    const anchorRef = useRef<HTMLButtonElement | null>(null)
    const [selected, setSelected] = useState<string>('')
    return (
      <div className="p-8">
        <button ref={anchorRef} type="button" className="rounded-md border px-3 py-1.5">
          选择成员：{selected || '未选择'}
        </button>
        <CwMessageInputMentionPanel
          value={true}
          items={items}
          highlightIndex={1}
          mentionAvatarFallbackSrc={fallbackAvatar}
          virtualReference={{
            getBoundingClientRect: () =>
              anchorRef.current?.getBoundingClientRect() ??
              new DOMRect(0, 0, 0, 0),
          }}
          onSelect={(item) => setSelected(item.label)}
        />
      </div>
    )
  },
}
