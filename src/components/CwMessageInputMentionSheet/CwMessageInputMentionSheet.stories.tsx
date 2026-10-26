import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { CwButton } from '../CwButton'
import { CwMessageInputMentionSheet } from './CwMessageInputMentionSheet'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'

const items: CwMessageInputMentionItem[] = [
  { id: 'u1', label: 'Alice', avatar: chatDefaultAvatar },
  { id: 'u2', label: 'Bob', avatar: chatDefaultAvatar },
  { id: 'u3', label: 'Carol', avatar: chatDefaultAvatar },
]

const meta: Meta<typeof CwMessageInputMentionSheet> = {
  title: '1. Components/Chat/CwMessageInputMentionSheet',
  component: CwMessageInputMentionSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '@ 提及成员选择 Sheet，配合 CwMessageInput 使用。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'boolean' }, description: '是否打开 Sheet' },
    searchQuery: { control: { type: 'text' }, description: '搜索关键词' },
    highlightIndex: { control: { type: 'number', min: 0, step: 1 }, description: '高亮选项索引' },
    mentionAvatarFallbackSrc: { control: false },
    items: { control: false },
    texts: { control: false },
  },
  args: {
    value: false,
    searchQuery: '',
    highlightIndex: 0,
  },
}

export default meta
type Story = StoryObj<typeof CwMessageInputMentionSheet>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selected, setSelected] = useState('')
    return (
      <div className="flex min-h-[24rem] items-start justify-center p-8">
        <CwButton type="primary" onClick={() => setOpen(true)}>
          打开 @ 面板{selected ? `（已选 ${selected}）` : ''}
        </CwButton>
        <CwMessageInputMentionSheet
          value={open}
          searchQuery={searchQuery}
          items={items}
          highlightIndex={0}
          mentionAvatarFallbackSrc={chatDefaultAvatar}
          onChange={setOpen}
          onSearchQueryChange={setSearchQuery}
          onSelect={(item) => {
            setSelected(item.label)
            setOpen(false)
          }}
        />
      </div>
    )
  },
}
