import type { Meta, StoryObj } from '@storybook/react'
import { TpCodePreview } from './TpCodePreview'

const meta: Meta<typeof TpCodePreview> = {
  title: '2. Third Party/Editor/TpCodePreview',
  component: TpCodePreview,
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: '代码内容',
    },
    language: {
      control: 'select',
      options: [
        'javascript',
        'typescript',
        'html',
        'css',
        'json',
        'markdown',
        'python',
        'java',
        'c',
        'cpp',
      ],
      description: '代码语言',
    },
    title: {
      control: 'text',
      description: '代码块标题',
    },
    copyable: {
      control: 'boolean',
      description: '是否可复制代码',
    },
  },
}

export default meta
type Story = StoryObj<typeof TpCodePreview>

export const TypeScript: Story = {
  args: {
    code: `interface Person {\n  name: string;\n  age: number;\n}\n\nfunction greet(person: Person): string {\n  return \`Hello, \${person.name}! You are \${person.age} years old.\`;\n}\n\nconst user: Person = {\n  name: 'Alice',\n  age: 30\n};\n\nconsole.log(greet(user));`,
    language: 'typescript',
    title: 'TypeScript示例',
    copyable: true,
  },
}

export const NoCopyButton: Story = {
  args: {
    code: `const styles = {\n  color: 'red',\n  fontSize: '16px',\n  fontWeight: 'bold'\n};\n\nconst element = document.getElementById('example');\nObject.assign(element.style, styles);`,
    language: 'javascript',
    title: 'JavaScript示例（不可复制）',
    copyable: false,
  },
}

export const NoTitle: Story = {
  args: {
    code: `body {\n  margin: 0;\n  padding: 0;\n  font-family: 'Arial', sans-serif;\n  line-height: 1.6;\n  color: #333;\n  background-color: #f5f5f5;\n}`,
    language: 'css',
    copyable: true,
  },
}
