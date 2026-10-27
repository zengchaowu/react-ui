import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { CwMessageInput } from './index'
import type { CwMessageInputMentionItem } from '@zengchaowu/ui-shared/components/CwMessageInput/types'

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
  { id: 'user_long', label: '欧阳娜娜娜娜娜娜娜' },
]

/* wire format 片段构造（属性名与 `@zengchaowu/shared/functions/im/imRichContentHtml` 对齐） */

/** 内联图片：`img[data-cw-inline-image]`，`src` 用 data URL + `width`/`height` 供 ImageClipNode.parseHTML 读取 */
const wireInlineImage = (width: number, height: number, color: string, alt: string) =>
  `<img data-cw-inline-image src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22${width}%22%20height=%22${height}%22%3E%3Crect%20width=%22${width}%22%20height=%22${height}%22%20fill=%22%23${color}%22/%3E%3C/svg%3E" alt="${alt}" width="${width}" height="${height}">`

/** 文件 chip，`lines` 对应 `data-lines`（可选） */
const wireFile = (path: string, label: string, lines?: string) =>
  `<span data-cw-file data-path="${path}" data-label="${label}"${lines ? ` data-lines="${lines}"` : ''}>${label}</span>`

/** @人 chip，`userId` 必须出现在 `mentionItems` 中，否则会被降级为纯文本 */
const wireMention = (userId: string, label: string) =>
  `<span data-cw-mention data-user-id="${userId}" data-label="${label}">@${label}</span>`

/** emoji 原子节点（沿用消息 wire format 的 `span[data-emoji]`） */
const wireEmoji = (glyph: string) => `<span data-emoji="${glyph}">${glyph}</span>`

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
      '<p>参考 <span data-cw-file data-path="src/components/CwMessageInput/types.ts" data-label="types.ts">types.ts</span> 和 <span data-cw-file data-path="src/components/CwMessageInput/chips/chipStyles.ts" data-label="chipStyles.ts">chipStyles.ts</span> 😂 这两处</p>' +
      '<p>长文件名（触发中间省略，用于核对 hover 只出现一层路径 tooltip）：<span data-cw-file data-path="src/components/CwMessageInput/chips/CwMessageInputInlineChipWithVeryLongFileName.tsx" data-label="CwMessageInputInlineChipWithVeryLongFileName.tsx">CwMessageInputInlineChipWithVeryLongFileName.tsx</span></p>' +
      '<p>这一行只有文字用于对比基线；再放一个 <span data-cw-mention data-user-id="user_2" data-label="李四">@李四</span>。<span data-emoji="😂">😂</span></p>',
  },
}

/**
 * 全特性混排（回归用）：把所有 chip 类型与排版形态塞进同一个输入框，
 * 一次性目视核对纵向对齐 / 截断 / 折行 / 行首行尾 / 连续 chip / 空段落等场景。
 */
export const KitchenSink: Story = {
  name: '全特性混排（回归）',
  args: {
    placeholder: '输入消息…',
    mentionItems,
    allowComposerAttachmentPipeline: true,
    value: [
      '<p>① 纯文字基线：本行只有正文，用作其它行 chip 的对齐参照。</p>',
      `<p>② 单个 @人：请 ${wireMention('user_1', '张三')} 看一下这里的对齐。</p>`,
      `<p>③ 单个文件 chip：参考 ${wireFile('src/components/CwMessageInput/types.ts', 'types.ts')} 的实现。</p>`,
      `<p>④ 带行号的文件 chip：${wireFile('src/components/CwMessageInput/chips/chipStyles.ts', 'chipStyles.ts', '12-40')} 这一段。</p>`,
      `<p>⑤ 超长文件名（应中间省略，hover 只显示一层路径 tooltip）：${wireFile('src/components/CwMessageInput/chips/CwMessageInputInlineChipWithVeryLongFileName.tsx', 'CwMessageInputInlineChipWithVeryLongFileName.tsx')}</p>`,
      `<p>⑥ 单个 emoji：${wireEmoji('😂')} 与文字同一行。</p>`,
      `<p>⑦ 连续 emoji 无空格：${wireEmoji('😂')}${wireEmoji('🎉')}${wireEmoji('👍')} 后面接文字。</p>`,
      `<p>⑧ 内联图片 80×40（等于宽高上限）：${wireInlineImage(80, 40, '4F8DF7', '标准图')} 后接文字。</p>`,
      `<p>⑨ 内联图片 20×40（竖图，受 minHeight 20 / maxHeight 40 约束）：${wireInlineImage(20, 40, '22C55E', '竖图')} 后接文字。</p>`,
      `<p>⑩ 内联图片 20×20（小图）：${wireInlineImage(20, 20, 'F59E0B', '小图')} 后接文字。</p>`,
      `<p>⑪ 同一行混排全部类型：文字 ${wireMention('user_2', '李四')} 中 ${wireFile('src/mixed.ts', 'mixed.ts')} 夹 ${wireEmoji('🎉')} 图 ${wireInlineImage(40, 30, 'EF4444', '混排图')} 结束。</p>`,
      `<p>${wireFile('src/line-start.ts', 'line-start.ts')} ⑫ 行首 chip，chip 紧贴段落开头。</p>`,
      `<p>⑬ 行尾 chip，chip 紧贴段落结尾 ${wireMention('user_3', '王五')}</p>`,
      `<p>⑭ 连续 chip 无空格：${wireFile('src/one.ts', 'one.ts')}${wireFile('src/two.ts', 'two.ts')}${wireMention('user_1', '张三')}${wireEmoji('👍')}</p>`,
      `<p>⑮ 长文本自动折行：这是一段很长很长的说明文字，用来触发输入框内的自动换行，中间插入一个 ${wireFile('src/middle-of-wrapped-line.ts', 'middle-of-wrapped-line.ts')} 用来观察折行后第二行里 chip 与正文的基线是否仍然对齐，后面继续补足更多文字以保证一定折到下一行。</p>`,
      `<p>⑯ 富文本与 chip 混排：<strong>加粗文字</strong> 与 <em>斜体文字</em> 中夹 ${wireMention('user_long', '欧阳娜娜娜娜娜娜娜')} 以及 ${wireEmoji('😂')}。</p>`,
      `<p>⑰ 只有 chip、没有任何文字：${wireFile('src/only-chip.ts', 'only-chip.ts')}${wireMention('user_2', '李四')}${wireEmoji('🎉')}${wireInlineImage(40, 30, '8B5CF6', '纯图')}</p>`,
      '<p>⑱ 硬换行（br）：第一行文字<br>第二行文字</p>',
      '<p>⑲ 空段落（本行下方为空段落）</p>',
      '<p></p>',
      '<p>⑳ 结尾文字行。</p>',
    ].join(''),
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
