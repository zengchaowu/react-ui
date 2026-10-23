import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwDocxEditor } from './CwDocxEditor'
import type { CwDocxEditorHandle, CwDocxEditorProps, CwDocxSource } from './types'
import { defaultTexts } from './texts'

const meta: Meta<typeof CwDocxEditor> = {
  title: '1. Components/Display/CwDocxEditor',
  component: CwDocxEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '自研 Word 预览和编辑。支持 run 级样式、段距/行距、列表编号、表格单元格多段落；导入 docx 导出时保留原包 styles/theme（仅替换正文 XML）。',
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

function FileActionsDemo(args: CwDocxEditorProps) {
  const editorRef = useRef<CwDocxEditorHandle | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [src, setSrc] = useState<CwDocxSource | null>(null)
  const [fileName, setFileName] = useState('文档.docx')
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
      const base = (fileName || '文档').replace(/\.[^.]+$/, '') || '文档'
      downloadBlob(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        `${base}.docx`,
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
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFile}
        />
      </div>
      <div className="min-h-0 flex-1">
        <CwDocxEditor ref={editorRef} className="h-full" {...args} src={src} />
      </div>
    </div>
  )
}

export const DocxEdit: Story = {
  args: {
    texts: defaultTexts,
    mode: 'edit',
  },
  render: (args) => <FileActionsDemo {...args} />,
}

export const DocxPreview: Story = {
  args: {
    texts: defaultTexts,
    mode: 'preview',
  },
  render: (args) => <FileActionsDemo {...args} />,
}
