import type { Meta, StoryObj } from '@storybook/react'
import { TpMonacoEditor } from './TpMonacoEditor'

const meta: Meta<typeof TpMonacoEditor> = {
  title: '2. Third Party/Editor/TpMonacoEditor',
  component: TpMonacoEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '基于Monaco Editor的代码编辑器组件，支持多种编程语言、主题和丰富的编辑功能。',
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
        'typescript',
        'html',
        'css',
        'json',
        'python',
        'java',
        'cpp',
        'csharp',
        'php',
        'go',
        'rust',
        'sql',
        'xml',
        'yaml',
        'markdown',
        'vue',
        'react',
      ],
      description: '编程语言',
    },
    theme: {
      control: { type: 'select' },
      options: ['vs', 'vs-dark', 'hc-black'],
      description: '编辑器主题',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    lineNumbers: {
      control: { type: 'select' },
      options: ['on', 'off', 'relative', 'interval'],
      description: '行号显示方式',
    },
    wordWrap: {
      control: { type: 'select' },
      options: ['off', 'on', 'wordWrapColumn', 'bounded'],
      description: '自动换行方式',
    },
    minimap: {
      control: { type: 'boolean' },
      description: '是否显示小地图',
    },
    folding: {
      control: { type: 'boolean' },
      description: '是否显示折叠按钮',
    },
    selectOnLineNumbers: {
      control: { type: 'boolean' },
      description: '是否显示选择高亮',
    },
    renderLineHighlight: {
      control: { type: 'select' },
      options: ['all', 'line', 'none', 'gutter'],
      description: '行高亮显示方式',
    },
    renderWhitespace: {
      control: { type: 'select' },
      options: ['none', 'boundary', 'selection', 'all'],
      description: '空白字符显示方式',
    },
    matchBrackets: {
      control: { type: 'select' },
      options: ['always', 'near'],
      description: '括号高亮方式',
    },
    autoClosingBrackets: {
      control: { type: 'select' },
      options: ['always', 'languageDefined', 'beforeWhitespace', 'never'],
      description: '自动闭合括号方式',
    },
    autoClosingQuotes: {
      control: { type: 'select' },
      options: ['always', 'languageDefined', 'beforeWhitespace', 'never'],
      description: '自动闭合引号方式',
    },
    autoIndent: {
      control: { type: 'select' },
      options: ['none', 'keep', 'brackets', 'advanced', 'full'],
      description: '自动缩进方式',
    },
    foldingStrategy: {
      control: { type: 'select' },
      options: ['auto', 'indentation'],
      description: '代码折叠策略',
    },
    showFoldingControls: {
      control: { type: 'select' },
      options: ['always', 'mouseover'],
      description: '折叠控件显示方式',
    },
    links: {
      control: { type: 'boolean' },
      description: '是否启用链接检测',
    },
    colorDecorators: {
      control: { type: 'boolean' },
      description: '是否启用颜色装饰器',
    },
    codeLens: {
      control: { type: 'boolean' },
      description: '是否启用代码镜头',
    },
    parameterHints: {
      control: { type: 'boolean' },
      description: '是否启用参数提示',
    },
    hover: {
      control: { type: 'boolean' },
      description: '是否启用悬停提示',
    },
    contextmenu: {
      control: { type: 'boolean' },
      description: '是否启用上下文菜单',
    },
    multiCursorModifier: {
      control: { type: 'select' },
      options: ['ctrlCmd', 'alt'],
      description: '多光标修改键',
    },
    scrollbar: {
      control: { type: 'boolean' },
      description: '是否启用滚动条',
    },
    smoothScrolling: {
      control: { type: 'boolean' },
      description: '是否启用平滑滚动',
    },
    mouseWheelZoom: {
      control: { type: 'boolean' },
      description: '是否启用鼠标滚轮缩放',
    },
    quickSuggestions: {
      control: { type: 'boolean' },
      description: '是否启用快速建议',
    },
    suggestOnTriggerCharacters: {
      control: { type: 'boolean' },
      description: '是否在触发字符时显示建议',
    },
    acceptSuggestionOnEnter: {
      control: { type: 'select' },
      options: ['on', 'smart', 'off'],
      description: '回车键接受建议方式',
    },
    acceptSuggestionOnCommitCharacter: {
      control: { type: 'boolean' },
      description: '是否在提交字符时接受建议',
    },
    height: {
      control: { type: 'text' },
      type: { name: 'string' },
      description: '编辑器高度（CSS 长度；全屏演示用 100vh。组件亦接受 number 设计稿 px）',
    },
    width: {
      control: { type: 'text' },
      type: { name: 'string' },
      description: '编辑器宽度（CSS 长度；全屏演示用 100%。组件亦接受 number 设计稿 px）',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用编辑器',
    },
    autoSave: {
      control: { type: 'boolean' },
      description: '是否启用自动保存',
    },
    autoSaveDelay: {
      control: { type: 'number' },
      description: '自动保存延迟时间（毫秒）',
    },
  },
}

export default meta
type Story = StoryObj<typeof TpMonacoEditor>

export const Default: Story = {
  args: {
    value:
      '// 欢迎使用 Monaco Editor\nconsole.log("Hello, World!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet("Monaco Editor");',
    language: 'javascript',
    theme: 'vs',
    width: '100%',
    height: '100vh',
  },
}

export const ReadOnly: Story = {
  args: {
    value:
      '// 只读模式示例\n// 此编辑器处于只读状态，无法编辑内容\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10)); // 55',
    language: 'javascript',
    theme: 'vs',
    readOnly: true,
    width: '100%',
    height: '100vh',
  },
}

export const WithMinimap: Story = {
  args: {
    value:
      '// 带小地图的编辑器\n' +
      Array.from({ length: 50 }, (_, i) => `// 这是第 ${i + 1} 行代码`).join('\n'),
    language: 'javascript',
    theme: 'vs',
    minimap: true,
    width: '100%',
    height: '100vh',
  },
}

export const AutoSave: Story = {
  args: {
    value:
      '// 自动保存示例\n// 修改内容后会自动保存\nlet counter = 0;\n\nfunction increment() {\n  counter++;\n  console.log(`Counter: ${counter}`);\n}\n\nsetInterval(increment, 1000);',
    language: 'javascript',
    theme: 'vs',
    autoSave: true,
    autoSaveDelay: 2000,
    width: '100%',
    height: '100vh',
  },
}

export const CustomOptions: Story = {
  args: {
    value:
      '// 自定义配置示例\nconst config = {\n  fontSize: 16,\n  fontFamily: "Fira Code, monospace",\n  lineHeight: 1.8,\n  tabSize: 4,\n  insertSpaces: true\n};\n\nconsole.log("自定义配置已应用");',
    language: 'javascript',
    theme: 'vs-dark',
    options: {
      fontSize: 16,
      fontFamily: 'Fira Code, monospace',
      lineHeight: 1.8,
      tabSize: 4,
      insertSpaces: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
    },
    width: '100%',
    height: '100vh',
  },
}
