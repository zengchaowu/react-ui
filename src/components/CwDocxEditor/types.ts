import type { HTMLAttributes } from 'react'
import type { CwDocxDocument, CwDocxSource, CwDocxEditorTexts, CwDocxInlineParagraph, CwDocxParagraph, CwDocxRun, CwDocxTable } from '@zengchaowu/ui-shared/components/CwDocxEditor/types'

export interface CwDocxEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'>,
    CwDocxEditorEmits {
  /** 受控文档。传入后以其为准，直到 src 再次变化。 */
  modelValue?: CwDocxDocument
  /** 从网址、二进制或 Blob 读入 docx */
  src?: CwDocxSource | null
  /**
   * preview 只查看。
   * edit 可改段落和表格文字，并添加段落。
   * @default 'edit'
   */
  mode?: 'preview' | 'edit'
  /** 只读查看，效果同 mode="preview" */
  readonly?: boolean
  texts?: Partial<CwDocxEditorTexts>
  /** 根容器额外 class（对应 Vue attrs.class） */
  className?: string
}

export interface CwDocxEditorEmits {
  /** 对应 Vue `update:modelValue` */
  onModelValueChange?: (document: CwDocxDocument) => void
  /** 对应 Vue `change` */
  onChange?: (document: CwDocxDocument) => void
}

/** defineExpose 对应的 imperative handle */
export interface CwDocxEditorHandle {
  toArrayBuffer: () => Promise<ArrayBuffer>
}

export interface CwDocxParagraphBlockProps {
  block: CwDocxInlineParagraph | CwDocxParagraph
  editable: boolean
  wrapperClass: string[]
  listLabel?: string
  /** 对应 Vue `update:runs` */
  onUpdateRuns?: (runs: CwDocxRun[]) => void
}

export interface CwDocxTableBlockProps {
  block: CwDocxTable
  editable: boolean
  /** 对应 Vue `change` */
  onChange?: () => void
}
