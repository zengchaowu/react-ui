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

/** chip 与文字混排：用于核对 chip 与正文的纵向视觉居中（含 @人 / 文件 / emoji / 多行） */
export const MixedContent: Story = {
  name: '混排（chip + 文字）',
  args: {
    placeholder: '输入消息…',
    mentionItems,
    allowComposerAttachmentPipeline: true,
    value:
      '<p>请 <span data-cw-mention data-user-id="user_1" data-label="张三">@张三</span> 看一下 CwMessageInput 的混排效果，谢谢</p>' +
      '<p>参考 <span data-cw-file data-path="src/components/CwMessageInput/CwMessageInput.tsx" data-label="CwMessageInput.tsx">CwMessageInput.tsx</span> 和 <span data-cw-file data-path="src/components/CwMessageInput/chips/chipStyles.ts" data-label="chipStyles.ts">chipStyles.ts</span> 😂 这两处</p>' +
      '<p>长文件名（触发中间省略，用于核对 hover 只出现一层路径 tooltip）：<span data-cw-file data-path="src/components/CwMessageInput/chips/CwMessageInputInlineChipWithVeryLongFileName.tsx" data-label="CwMessageInputInlineChipWithVeryLongFileName.tsx">CwMessageInputInlineChipWithVeryLongFileName.tsx</span></p>' +
      '<p>这一行只有文字用于对比基线；再放一个 <span data-cw-mention data-user-id="user_2" data-label="李四">@李四</span>。<span data-emoji="😂">😂</span></p>',
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
