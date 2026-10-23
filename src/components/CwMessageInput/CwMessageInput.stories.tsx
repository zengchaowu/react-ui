import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { CwMessageInput } from './index'
import type { CwMessageInputMentionItem } from './types'

const meta: Meta<typeof CwMessageInput> = {
  title: '1. Components/Chat/CwMessageInput',
  component: CwMessageInput,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    allowComposerAttachmentPipeline: { control: 'boolean' },
    fixedTextareaRows: { control: { type: 'number', min: 1, max: 10 } },
    placeholder: { control: 'text' },
  },
  args: {
    mentionAvatarFallbackSrc: chatDefaultAvatar,
  },
}

export default meta
type Story = StoryObj<typeof CwMessageInput>

const mentionItems: CwMessageInputMentionItem[] = [
  { id: 'user_1', label: '张三' },
  { id: 'user_2', label: '李四' },
  { id: 'user_3', label: '王五' },
]

export const Default: Story = {
  args: {
    placeholder: '输入消息…',
  },
}

export const WithMentions: Story = {
  args: {
    placeholder: '输入 @ 触发提及',
    mentionItems,
  },
}

/** 待传附件 UI 与工具栏入口见 `CwChatMessageComposer` */
export const WithComposerAttachmentPipeline: Story = {
  name: 'Composer 附件通道（仅编辑器内拖/贴图）',
  args: {
    placeholder:
      '开启后，在编辑器内粘贴/拖入图片为内联 clip；传入 onDroppedFiles 可改由外部处理',
    allowComposerAttachmentPipeline: true,
  },
}

/** 拖入带后缀的文件或 insertFileRef：自动使用 Material 文件图标 */
export const WithFileIcons: Story = {
  args: {
    placeholder: '拖入文件到编辑器区域，查看扩展名图标（需 Composer 管道开启）',
    allowComposerAttachmentPipeline: true,
  },
}

export const FixedRows: Story = {
  args: {
    placeholder: '固定 2 行高度',
    fixedTextareaRows: 2,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '<p>已禁用的输入框</p>',
  },
}
