import type { Meta, StoryObj } from '@storybook/react'
import { TpCodeEditor } from './TpCodeEditor'
import { defaultTexts } from './texts'

const meta: Meta<typeof TpCodeEditor> = {
  title: '2. Third Party/Editor/TpCodeEditor',
  component: TpCodeEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '基于 CodeMirror 的代码编辑器组件，支持多种编程语言、主题和丰富的编辑功能。',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '编辑器内容',
    },
    language: {
      control: { type: 'select' },
      options: [
        'javascript',
        'html',
        'css',
        'json',
        'python',
        'java',
        'cpp',
        'xml',
        'markdown',
        'sql',
        'vue',
      ],
      description: '编程语言',
    },
    theme: {
      control: { type: 'select' },
      options: ['auto', 'light', 'dark'],
      description: '编辑器主题；auto 跟随应用 data-theme',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    lineNumbers: {
      control: { type: 'boolean' },
      description: '是否显示行号',
    },
    lineWrapping: {
      control: { type: 'boolean' },
      description: '是否自动换行',
    },
    foldGutter: {
      control: { type: 'boolean' },
      description: '是否显示折叠箭头（iconfont；展开箭头仅 hover/当前行可见）',
    },
    searchKeymap: {
      control: { type: 'boolean' },
      description: '是否显示搜索面板',
    },
    autocompletion: {
      control: { type: 'boolean' },
      description: '是否显示自动补全',
    },
    height: {
      control: { type: 'text' },
      description: '编辑器高度（CSS 长度；全屏演示用 100vh。组件亦接受 number 设计稿 px）',
    },
    width: {
      control: { type: 'text' },
      description: '编辑器宽度（CSS 长度；全屏演示用 100%。组件亦接受 number 设计稿 px）',
    },
    placeholder: {
      control: { type: 'text' },
      description: '占位符文本',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用编辑器',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    texts: defaultTexts,
    value: 'console.log("Hello, CodeMirror!");',
    language: 'javascript',
    theme: 'light',
    height: '100vh',
    width: '100%',
    lineNumbers: true,
    autocompletion: true,
  },
}

export const ReadOnly: Story = {
  args: {
    texts: defaultTexts,
    value: `// 这是一个只读的代码编辑器
// 用户无法编辑此内容
function example() {
  return "只读模式";
}`,
    language: 'javascript',
    theme: 'light',
    readOnly: true,
    height: '100vh',
    width: '100%',
  },
}

export const Disabled: Story = {
  args: {
    texts: defaultTexts,
    value: '// 编辑器已禁用',
    language: 'javascript',
    theme: 'light',
    disabled: true,
    height: '100vh',
    width: '100%',
  },
}
