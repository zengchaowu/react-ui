import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import CwExcelEditor from './CwExcelEditor'
import type { CwExcelEditorHandle } from './types'
import { defaultTexts } from './texts'
import type { CwExcelCellValue, CwExcelSource, CwExcelWorkbook } from './types'
import sampleDataCsv from '../../storybook/assets/tp-office-preview/sample-data.csv?url'

const meta: Meta<typeof CwExcelEditor> = {
  title: '1. Components/Display/CwExcelEditor',
  component: CwExcelEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '基于 CwDataTable 的表格查看和编辑。Story 可以导入 xlsx / csv 看解析结果，再导出 xlsx。导出沿用原来的 xlsx，没改过的样式、图片和公式都还在。',
      },
    },
  },
  argTypes: {
    src: {
      control: { type: 'text' },
      description: 'xlsx / csv 来源，可以是 URL、File 或 ArrayBuffer',
    },
    fileName: {
      control: { type: 'text' },
      description: '用于判断 csv / xlsx 的文件名',
    },
    mode: {
      control: { type: 'select' },
      options: ['preview', 'edit'],
    },
    readonly: { control: 'boolean' },
    headerRow: { control: 'boolean' },
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
  const editorRef = useRef<CwExcelEditorHandle | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [src, setSrc] = useState<CwExcelSource | null>((args?.src as CwExcelSource | null) ?? null)
  const [fileName, setFileName] = useState(
    typeof args?.fileName === 'string' ? args.fileName : '',
  )
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
      const blob = await editor.toBlob()
      const base = (fileName || '表格').replace(/\.[^.]+$/, '') || '表格'
      downloadBlob(blob, `${base}.xlsx`)
    } catch {
      setStatus('导出失败')
    }
  }

  const { src: _src, fileName: _fileName, ...rest } = args ?? {}

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
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          onChange={onFile}
        />
      </div>
      <div className="min-h-0 flex-1">
        <CwExcelEditor
          ref={editorRef}
          className="h-full"
          {...rest}
          src={src}
          fileName={fileName}
        />
      </div>
    </div>
  )
}

export const CsvPreview: Story = {
  args: {
    texts: defaultTexts,
    src: sampleDataCsv,
    fileName: 'sample-data.csv',
    mode: 'preview',
    headerRow: false,
  },
  render: (args) => <WithFileActions {...args} />,
}

const mergedWorkbook = {
  sheets: [
    {
      name: 'Sheet1',
      cells: [
        ['标题', null, null, '数量'],
        [null, null, null, 12],
        ['说明', null, '备注', null],
        [null, null, null, null],
      ],
      merges: [
        { row: 0, col: 0, rowspan: 2, colspan: 3 },
        { row: 2, col: 0, rowspan: 1, colspan: 2 },
        { row: 2, col: 2, rowspan: 2, colspan: 2 },
      ],
    },
  ],
}

export const MergeEdit: Story = {
  args: {
    texts: defaultTexts,
    modelValue: mergedWorkbook,
    mode: 'edit',
    headerRow: false,
  },
  render: (args) => <WithFileActions {...args} />,
}

export const CsvEdit: Story = {
  args: {
    texts: defaultTexts,
    src: sampleDataCsv,
    fileName: 'sample-data.csv',
    mode: 'edit',
    headerRow: false,
  },
  render: (args) => <WithFileActions {...args} />,
}

const PERFORMANCE_ROW_COUNT = 100_000
const PERFORMANCE_COL_COUNT = 80

function createPerformanceWorkbook(): CwExcelWorkbook {
  const cells: CwExcelCellValue[][] = []
  for (let row = 0; row < PERFORMANCE_ROW_COUNT; row += 1) {
    const line = new Array<CwExcelCellValue>(PERFORMANCE_COL_COUNT)
    for (let col = 0; col < PERFORMANCE_COL_COUNT; col += 1) {
      line[col] = col === 0 ? row + 1 : row * PERFORMANCE_COL_COUNT + col
    }
    cells.push(line)
  }
  return {
    sheets: [{ name: '性能', cells, merges: [] }],
  }
}

export const Performance: Story = {
  name: '性能',
  args: {
    texts: defaultTexts,
    mode: 'edit',
    headerRow: false,
  },
  parameters: {
    docs: {
      description: {
        story: '10 万行、80 列。纵向只渲染可见行，横向只挂视口附近的列。大数据不要放进 args，Controls 深拷贝会卡住进入 Story。',
      },
    },
  },
  render: function PerformanceStory(args) {
    const [workbook, setWorkbook] = useState<CwExcelWorkbook>(() => createPerformanceWorkbook())
    return (
      <div className="flex h-[100vh] w-full flex-col">
        <div className="shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-3 py-2 text-sm text-[var(--text-color-primary)]">
          <div className="font-medium">
            性能（{PERFORMANCE_ROW_COUNT} 行 × {PERFORMANCE_COL_COUNT} 列）
          </div>
          <div className="text-xs text-[var(--text-color-secondary)]">
            滚动表格查看效果。纵向虚拟滚动只渲染可见行，横向只挂视口附近的列。
            打开开发者工具，DOM 里只有少量行和列，而不是全部 {PERFORMANCE_ROW_COUNT} ×{' '}
            {PERFORMANCE_COL_COUNT} 个格子。
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <CwExcelEditor
            className="h-full"
            modelValue={workbook}
            onModelValueChange={setWorkbook}
            texts={args.texts}
            mode={args.mode}
            headerRow={args.headerRow}
          />
        </div>
      </div>
    )
  },
}
