import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwPptEditor } from './CwPptEditor'
import type { CwPptEditorHandle, CwPptEditorProps } from './types'
import type { CwPptSource } from '@zengchaowu/ui-shared/components/CwPptEditor/types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwPptEditor/texts'

const meta: Meta<typeof CwPptEditor> = {
  title: '1. Components/Display/CwPptEditor',
  component: CwPptEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '自研演示文稿预览和编辑。导入会保留背景色、色块、位图/SVG 图片和文字颜色，再按同样的页面尺寸导出。动画、图表、视频和复杂形状不会完整保留。PPT 内嵌字体会在后台解压并注册（毛笔/艺术字可正常显示），文稿未引用或格式不支持的字体会回退为楷体/雅黑等系统字体，版式可能与 WPS 有差异。',
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['preview', 'edit'],
    },
    readonly: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const barButton =
  'cursor-pointer rounded border border-[var(--border-color)] bg-[var(--bg-color-container)] px-3 py-1 text-xs text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)]'

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function FileActionsDemo(args: CwPptEditorProps) {
  const editorRef = useRef<CwPptEditorHandle | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [src, setSrc] = useState<CwPptSource | null>(null)
  const [fileName, setFileName] = useState('演示文稿.pptx')
  const [status, setStatus] = useState('')

  function pick() {
    inputRef.current?.click()
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    setFileName(file.name)
    setSrc(file)
    setStatus(file.name)
  }

  async function save() {
    const editor = editorRef.current
    if (!editor) return
    setStatus('')
    try {
      const buffer = await editor.toArrayBuffer()
      const base = (fileName || '演示文稿').replace(/\.[^.]+$/, '') || '演示文稿'
      downloadBlob(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        }),
        `${base}.pptx`,
      )
    } catch {
      setStatus('导出失败')
    }
  }

  return (
    <div className="flex h-[100vh] w-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-3 py-2">
        <button type="button" className={barButton} onClick={pick}>
          导入
        </button>
        <button type="button" className={barButton} onClick={save}>
          导出
        </button>
        <span className="min-w-0 truncate text-xs text-[var(--text-color-secondary)]">{status}</span>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={onFile}
        />
      </div>
      <div className="min-h-0 flex-1">
        <CwPptEditor ref={editorRef} className="h-full" {...args} src={src} />
      </div>
    </div>
  )
}

export const PptEdit: Story = {
  args: {
    texts: defaultTexts,
    mode: 'edit',
  },
  render: (args) => <FileActionsDemo {...args} />,
}

export const PptPreview: Story = {
  args: {
    texts: defaultTexts,
    mode: 'preview',
  },
  render: (args) => <FileActionsDemo {...args} />,
}
