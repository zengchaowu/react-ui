import type { Meta, StoryObj } from '@storybook/react'
import { CwGrid } from '../CwGrid'
import { CwFileIcon } from './CwFileIcon'

const meta: Meta<typeof CwFileIcon> = {
  title: '1. Components/Media/CwFileIcon',
  component: CwFileIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '基于 Catppuccin Icons 的文件图标组件，根据文件路径自动匹配对应的图标。',
      },
    },
  },
  argTypes: {
    path: {
      control: { type: 'text' },
      description: '文件路径（用于匹配图标）',
    },
    isDirectory: {
      control: { type: 'boolean' },
      description: '是否为目录',
    },
    size: {
      control: { type: 'number' },
      description: '图标尺寸（rem）',
    },
    baseUrl: {
      control: { type: 'text' },
      description: '基础 URL（用于构建图标路径）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwFileIcon>

// 默认示例
export const Default: Story = {
  args: {
    path: 'src/main.ts',
    isDirectory: false,
    size: 2,
  },
  render: (args) => (
    <div className="flex items-center justify-center p-8 bg-[var(--bg-color-container)] rounded-lg">
      <CwFileIcon {...args} />
    </div>
  ),
}

const files = [
  { path: 'main.ts', label: 'TypeScript' },
  { path: 'App.vue', label: 'Vue' },
  { path: 'package.json', label: 'NPM' },
  { path: 'README.md', label: 'Markdown' },
  { path: 'style.css', label: 'CSS' },
  { path: 'script.js', label: 'JavaScript' },
  { path: 'index.html', label: 'HTML' },
  { path: 'Dockerfile', label: 'Docker' },
  { path: '.gitignore', label: 'Git' },
  { path: 'api.py', label: 'Python' },
  { path: 'data.sql', label: 'SQL' },
  { path: 'config.yaml', label: 'YAML' },
]

const folders = [
  { path: 'src', label: '源代码' },
  { path: 'components', label: '组件' },
  { path: 'assets', label: '资源' },
  { path: 'utils', label: '工具' },
  { path: 'node_modules', label: '依赖' },
  { path: '.git', label: 'Git' },
  { path: 'dist', label: '构建产物' },
  { path: 'docs', label: '文档' },
]

// 文件图标展示
export const FileIcons: Story = {
  render: () => (
    <div className="flex w-[40rem] max-w-full flex-col items-center gap-4 p-8">
      <div className="mb-2 text-sm text-[var(--text-color-secondary)]">文件图标</div>
      <CwGrid className="w-full" columns={4} gutter={24} rowGap={24} align="top">
        {files.map((file) => (
          <div key={file.path} className="flex w-full min-w-0 flex-col items-center gap-2">
            <CwFileIcon path={file.path} size={2} className="shrink-0" />
            <span className="text-xs text-[var(--text-color-secondary)]">{file.label}</span>
            <span
              className="w-full truncate text-center text-[0.625rem] text-[var(--text-color-placeholder)]"
              title={file.path}
            >
              {file.path}
            </span>
          </div>
        ))}
      </CwGrid>
    </div>
  ),
}

// 目录图标展示
export const FolderIcons: Story = {
  render: () => (
    <div className="flex w-[40rem] max-w-full flex-col items-center gap-4 p-8">
      <div className="mb-2 text-sm text-[var(--text-color-secondary)]">目录图标</div>
      <CwGrid className="w-full" columns={4} gutter={24} rowGap={24} align="top">
        {folders.map((folder) => (
          <div key={folder.path} className="flex w-full min-w-0 flex-col items-center gap-2">
            <CwFileIcon path={folder.path} isDirectory size={2} className="shrink-0" />
            <span className="text-xs text-[var(--text-color-secondary)]">{folder.label}</span>
            <span
              className="w-full truncate text-center text-[0.625rem] text-[var(--text-color-placeholder)]"
              title={folder.path}
            >
              {folder.path}
            </span>
          </div>
        ))}
      </CwGrid>
    </div>
  ),
}

// 不同尺寸
export const Sizes: Story = {
  render: () => {
    const sizes = [1, 1.5, 2, 3, 4]
    const sizeLabels = ['16px', '24px', '32px', '48px', '64px']
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">不同尺寸</div>
        <div className="flex items-center gap-8">
          {sizes.map((size, index) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <CwFileIcon path="main.ts" size={size} />
              <span className="text-xs text-[var(--text-color-placeholder)]">
                {sizeLabels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

// 完整路径
export const FullPaths: Story = {
  render: () => {
    const paths = [
      'src/components/Button.vue',
      'src/utils/helper.ts',
      'public/favicon.ico',
      'tests/unit/App.spec.ts',
    ]
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">完整路径</div>
        <div className="flex flex-col gap-4">
          {paths.map((path) => (
            <div key={path} className="flex items-center gap-3">
              <CwFileIcon path={path} size={1.5} />
              <span className="text-sm text-[var(--text-color-primary)]">{path}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

// 自定义样式
export const CustomStyles: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">自定义样式</div>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <CwFileIcon
            path="main.ts"
            size={3}
            className="p-2 bg-[var(--button-brand-tint-active-bg)] rounded-lg"
          />
          <span className="text-xs text-[var(--text-color-placeholder)]">背景色</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CwFileIcon
            path="main.ts"
            size={3}
            className="p-2 border-2 border-[var(--brand-color-6)] rounded-lg"
          />
          <span className="text-xs text-[var(--text-color-placeholder)]">边框</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CwFileIcon
            path="main.ts"
            size={3}
            className="p-2 bg-[var(--bg-color-container)] rounded-full shadow-md"
          />
          <span className="text-xs text-[var(--text-color-placeholder)]">阴影</span>
        </div>
      </div>
    </div>
  ),
}
