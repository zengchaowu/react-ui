import type { Meta, StoryObj } from '@storybook/react'
import { CwMarkdown } from './CwMarkdown'

const meta: Meta<typeof CwMarkdown> = {
  title: '1. Components/Display/CwMarkdown',
  component: CwMarkdown,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof CwMarkdown>

const sampleMarkdown = `# 标题一

这是一段**粗体**与*斜体*以及 \`inline code\` 的段落。

## 标题二

- 无序列表项 A
- 无序列表项 B

1. 有序列表一
2. 有序列表二

> 引用块
> 多行引用

\`\`\`js
const x = 1
console.log(x)
\`\`\`

---

[链接文字](https://example.com)

![图片](https://picsum.photos/200/100)
`

export const Default: Story = {
  args: {
    content: sampleMarkdown,
    disabled: false,
    readonly: false,
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
  },
}

export const StreamingPartial: Story = {
  args: {
    content: `# 流式内容

前半段已到达的 **Markdown** 文本，后续内容仍在`,
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
  },
}
