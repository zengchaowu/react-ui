import type { HTMLAttributes } from 'react'

/** docx 来源。字符串按 URL 拉取。 */
export type CwDocxSource = string | ArrayBuffer | Blob

export type CwDocxAlign = 'left' | 'center' | 'right' | 'both'

/** Run 级字符样式（对应 OOXML w:r / w:rPr 子集）。 */
export interface CwDocxRun {
  text: string
  bold?: boolean
  italic?: boolean
  /** Word 半磅值，例如 21 表示 10.5pt。 */
  fontSize?: number
}

/** 段落内容（正文块或表格单元格内，无 kind）。 */
export type CwDocxInlineParagraph = Omit<CwDocxParagraph, 'kind'>

export interface CwDocxParagraph {
  id: string
  kind: 'paragraph'
  runs: CwDocxRun[]
  /** 0 是正文，1 及以上是标题级别（w:pStyle）。 */
  level: number
  /** 原始 w:pStyle，导出时优先写回。 */
  styleId?: string
  align?: CwDocxAlign
  /** 左缩进，单位 twips（1/1440 英寸）。 */
  indentLeft?: number
  /** 首行缩进，单位 twips。 */
  indentFirstLine?: number
  /** 段前间距，twips。 */
  spaceBefore?: number
  /** 段后间距，twips。 */
  spaceAfter?: number
  /** 行距值，配合 lineRule。 */
  line?: number
  lineRule?: 'auto' | 'exact' | 'atLeast'
  /** 列表编号（w:numPr）。 */
  numId?: number
  ilvl?: number
}

export interface CwDocxImage {
  id: string
  kind: 'image'
  dataUrl: string
  /** 导入时 document.xml.rels 中的 Id，导出可复用原 media。 */
  sourceRelId?: string
  /** 导入时 Relationship Target，例如 media/image1.png。 */
  sourceMediaTarget?: string
}

export interface CwDocxTableCell {
  paragraphs: CwDocxInlineParagraph[]
  colSpan?: number
  /** vertical merge：续行单元格仅占位，不渲染。 */
  vMergeContinue?: boolean
}

export interface CwDocxTable {
  id: string
  kind: 'table'
  rows: CwDocxTableCell[][]
}

export type CwDocxBlock = CwDocxParagraph | CwDocxImage | CwDocxTable

export interface CwDocxDocument {
  blocks: CwDocxBlock[]
  /**
   * 导入时的原始 docx 包。导出时保留 styles/theme/settings 等，仅替换 document.xml 正文。
   * 不参与 JSON 相等比较。
   */
  originalPackage?: ArrayBuffer
  /** 原稿最后一节 w:sectPr，导出时写回。 */
  sectPrXml?: string
  /** 原稿 numbering.xml，用于列表前缀计算。 */
  numberingXml?: string
}

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

export interface CwDocxEditorTexts {
  loadingText: string
  loadError: string
  addParagraph: string
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

export interface CwDocxEditorStyles {
  root: string
  toolbar: string
  actions: string
  action: string
  stage: string
  page: string
  paragraph: string
  heading1: string
  heading2: string
  heading3: string
  paragraphBody: string
  run: string
  listLabel: string
  table: string
  row: string
  cell: string
  image: string
  loading: string
  loadingText: string
  statusError: string
}
