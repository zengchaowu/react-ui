import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import CwPdfEditor from './CwPdfEditor'
import type { CwPdfEditorHandle } from './types'
import type { CwPdfSource } from '@zengchaowu/ui-shared/components/CwPdfEditor/types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwPdfEditor/texts'
import samplePdf from '../../storybook/assets/cw-pdf-editor/sample.pdf?url'

const meta: Meta<typeof CwPdfEditor> = {
  title: '1. Components/Display/CwPdfEditor',
  component: CwPdfEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '自研 PDF 预览；内联编辑仍为实验能力（见组件目录 EDITING-TODO.md）。预览稳定；编辑模式点原文改字、导出盖住旧字等尚未闭环。',
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['preview', 'edit'],
    },
    readonly: { control: 'boolean' },
    showHeader: { control: 'boolean' },
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

function WithFileActions(args: Story['args']) {
  const editorRef = useRef<CwPdfEditorHandle | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [src, setSrc] = useState<CwPdfSource | null>((args?.src as CwPdfSource | null) ?? null)
  const [fileName, setFileName] = useState('sample.pdf')
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
      downloadBlob(new Blob([buffer], { type: 'application/pdf' }), `${base}.pdf`)
    } catch {
      setStatus('导出失败')
    }
  }

  const { src: _src, ...rest } = args ?? {}

  return (
    <div className="flex h-[100vh] w-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-3 py-2">
        <button type="button" className={barButton} onClick={pick}>
          导入
        </button>
        <button type="button" className={barButton} onClick={save}>
          导出
        </button>
        <span className="min-w-0 truncate text-xs text-[var(--text-color-secondary)]">
          {status}
        </span>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFile}
        />
      </div>
      <div className="min-h-0 flex-1">
        <CwPdfEditor ref={editorRef} className="h-full" {...rest} src={src} />
      </div>
    </div>
  )
}

export const PdfPreview: Story = {
  args: {
    texts: defaultTexts,
    src: samplePdf,
    mode: 'preview',
    showHeader: true,
  },
  render: (args) => <WithFileActions {...args} />,
}

export const PdfEdit: Story = {
  args: {
    texts: defaultTexts,
    src: samplePdf,
    mode: 'edit',
  },
  render: (args) => <WithFileActions {...args} />,
}
