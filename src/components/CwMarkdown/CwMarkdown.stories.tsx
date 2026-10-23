import type { Meta, StoryObj } from '@storybook/react'
import { CwMarkdown } from './CwMarkdown'
import type { CwMarkdownCodeBlockExtensionProps } from './types'

const meta: Meta<typeof CwMarkdown> = {
  title: '1. Components/Display/CwMarkdown',
  component: CwMarkdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Markdown 展示组件，支持流式/不完整内容渲染。围栏代码块使用 highlight.js 语法高亮（随设计 token 适配亮/暗色）。非标准能力（如 mermaid、内联视频）由使用方通过扩展 API 注入，组件库仅提供标准图片/代码块等。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: { type: 'text' },
      description: 'Markdown 源文本',
    },
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    onLinkClick: { action: 'link-click' },
    onImageClick: { action: 'image-click' },
    onImageContextMenu: { action: 'image-contextmenu' },
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

/** 覆盖所有支持语法的完整示例，用于文档与回归 */
const allSyntaxMarkdown = `# 标题 H1

## 标题 H2

### 标题 H3

#### 标题 H4

##### 标题 H5

###### 标题 H6

---

**粗体** 与 *斜体* 与 _下划线斜体_ 与 \`行内代码\`。

[普通链接](https://example.com)、[带 title 的链接](https://example.com "链接标题")。

![图片](https://picsum.photos/300/150 "图片 title")、![仅 alt](https://picsum.photos/200/100)

混合：**粗体里*斜体*和\`代码\`** 与 *斜体里**粗体***。

---

无序列表（-）：

- 项 A
- 项 B
- 项 C

无序列表（*）：

* 项 1
* 项 2

无序列表（+）：

+ 项 x
+ 项 y

有序列表：

1. 第一
2. 第二
3. 第三

有序列表（自定义起始，从 5 开始）：

5. 第五
6. 第六
7. 第七

---

> 单行引用

> 多行引用
> 第二行
> 第三行

---

水平分割线（---）：

---

水平分割线（***）：

***

水平分割线（___）：

___

---

代码块（无语言）：

\`\`\`
plain
  code
\`\`\`

代码块（带语言 js）：

\`\`\`js
function hello() {
  console.log("Hello")
}
\`\`\`

代码块（带语言 html）：

\`\`\`html
<div class="box">content</div>
\`\`\`

---

空行分段：

上一段结束。

这是新的一段。
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

export const AllSyntax: Story = {
  args: {
    content: allSyntaxMarkdown,
    disabled: false,
    readonly: false,
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
  },
  parameters: {
    docs: {
      description: {
        story:
          '演示所有支持的 Markdown 语法：标题 H1–H6、粗体/斜体/行内代码、链接（含 title）、图片（含 alt/title）、无序列表（- * +）、有序列表（含自定义 start）、引用、水平线（--- *** ___）、代码块（无语言/带语言）、段落与空行分段。',
      },
    },
  },
}

function DiagramExtension({ block }: CwMarkdownCodeBlockExtensionProps) {
  return (
    <div className="rounded border border-dashed border-[var(--border-color)] bg-[var(--bg-color-component)] p-3 text-sm text-[var(--text-color-secondary)]">
      扩展渲染：<code>{block.language}</code>
      <pre className="mt-2 m-0 text-[var(--text-color-primary)]">
        <code>{block.code}</code>
      </pre>
    </div>
  )
}

export const CodeBlockExtension: Story = {
  args: {
    content: `# 代码块扩展示例

\`\`\`diagram
[自定义扩展占位：实际渲染由使用方通过 codeBlockExtensions 注入]
\`\`\`

标准 \`\`\`js 代码块不受影响：

\`\`\`js
console.log('hello')
\`\`\`
`,
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
    codeBlockExtensions: [
      {
        match: (lang) => lang?.trim().toLowerCase() === 'diagram',
        component: DiagramExtension,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '非标准 Markdown 能力（如 mermaid）由使用方通过 `codeBlockExtensions` prop 或 `provide(CwMarkdownCodeBlockExtensionsKey)` 注入；内联视频等可通过 `inlineImageExtensions` / `provide(CwMarkdownInlineImageExtensionsKey)` 注入。',
      },
    },
  },
}

export const StreamingPartial: Story = {
  args: {
    content: `# 流式内容

前半段已到达的 **Markdown** 文本，后续内容仍在`,
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
  },
  parameters: {
    docs: {
      description: {
        story: '支持不完整/流式 Markdown，不依赖完整结构解析。',
      },
    },
  },
}

export const LinkClick: Story = {
  args: {
    content: '请点击 [示例链接](https://example.com) 查看事件。',
    size: 'medium',
    className: 'w-full max-w-2xl p-6',
  },
  render: (args) => {
    const onLinkClick = (href: string, e: { preventDefault: () => void }) => {
      e.preventDefault()
      console.log('link-click', href)
    }
    return <CwMarkdown {...args} onLinkClick={onLinkClick} />
  },
}
