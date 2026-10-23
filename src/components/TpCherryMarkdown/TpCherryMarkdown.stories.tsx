import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TpCherryMarkdown } from './TpCherryMarkdown'
import type { TpCherryMarkdownProps } from './types'
import { numberControlArgType } from '../../storybook/argTypes'

const meta: Meta<typeof TpCherryMarkdown> = {
  title: '2. Third Party/Editor/TpCherryMarkdown',
  component: TpCherryMarkdown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '基于 Cherry Markdown 的富文本编辑器组件，支持实时预览、多种编辑模式和主题切换。',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Markdown 内容',
    },
    mode: {
      control: 'select',
      options: ['edit', 'preview', 'editOnly', 'previewOnly'],
      description: '编辑器模式',
    },
    theme: {
      control: 'select',
      options: ['default', 'dark'],
      description: '编辑器主题',
    },
    height: numberControlArgType({
      min: 0,
      step: 8,
      description: '编辑器高度：number 为设计稿 px（→ rem）；string 可为 CSS 长度',
    }),
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    placeholder: {
      control: 'text',
      description: '占位符文本',
    },
    toolbar: {
      control: 'boolean',
      description: '是否显示工具栏',
    },
    autofocus: {
      control: 'boolean',
      description: '是否自动聚焦',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TpCherryMarkdown>

const defaultMarkdown = `# Cherry Markdown 编辑器

这是一个基于 **Cherry Markdown** 的富文本编辑器组件。

## 功能特性

- ✅ 实时预览
- ✅ 多种编辑模式
- ✅ 主题切换
- ✅ 工具栏支持
- ✅ 文件上传

## 代码示例

\`\`\`javascript
const message = 'Hello, Cherry Markdown!'
console.log(message)
\`\`\`

## 表格示例

| 功能 | 支持 | 说明 |
|------|------|------|
| 编辑 | ✅ | 支持实时编辑 |
| 预览 | ✅ | 支持实时预览 |
| 主题 | ✅ | 支持明暗主题 |

## 引用

> Cherry Markdown 是一个具有开箱即用、轻量简洁、易于扩展等特点的 Javascript Markdown 编辑器。

---

**享受 Markdown 编写的乐趣！** 🎉`

function MarkdownDemo(args: TpCherryMarkdownProps) {
  const [value, setValue] = useState(args.value ?? '')
  return <TpCherryMarkdown {...args} value={value} onValueChange={setValue} />
}

export const Default: Story = {
  args: {
    value: defaultMarkdown,
    mode: 'edit',
    theme: 'default',
    height: 500,
    disabled: false,
    placeholder: '请输入Markdown内容...',
    toolbar: true,
    autofocus: false,
  },
  render: (args) => <MarkdownDemo {...args} />,
}

export const PreviewOnly: Story = {
  args: {
    ...Default.args,
    mode: 'previewOnly',
    value:
      '# 预览模式\n\n这是一个**只读预览**模式的示例。\n\n- 无法编辑内容\n- 只能查看渲染结果\n- 适合展示场景',
  },
  render: Default.render,
}

export const EditOnly: Story = {
  args: {
    ...Default.args,
    mode: 'editOnly',
    value:
      '# 编辑模式\n\n这是一个**纯编辑**模式的示例。\n\n- 只显示编辑器\n- 不显示预览\n- 适合专注编写',
  },
  render: Default.render,
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    value:
      '# 禁用状态\n\n这是一个**禁用状态**的示例。\n\n- 无法编辑内容\n- 只能查看\n- 适合只读场景',
  },
  render: Default.render,
}

export const NoToolbar: Story = {
  args: {
    ...Default.args,
    toolbar: false,
    value:
      '# 无工具栏\n\n这是一个**无工具栏**的示例。\n\n- 隐藏工具栏\n- 更简洁的界面\n- 适合嵌入场景',
  },
  render: Default.render,
}

export const CustomHeight: Story = {
  args: {
    ...Default.args,
    height: 300,
    value:
      '# 自定义高度\n\n这是一个**自定义高度**的示例。\n\n编辑器高度设置为 300（设计稿 px）。',
  },
  render: Default.render,
}

export const WithFileUpload: Story = {
  args: {
    ...Default.args,
    value:
      '# 文件上传\n\n这是一个支持**文件上传**的示例。\n\n你可以拖拽图片到编辑器中，或者使用工具栏的上传按钮。',
    fileUpload: async (file: File) => {
      // 模拟文件上传
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const url = URL.createObjectURL(file)
          resolve(url)
        }, 1000)
      })
    },
  },
  render: Default.render,
}
