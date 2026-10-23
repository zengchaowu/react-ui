/** PDF 来源。字符串按 URL 拉取。 */
export type CwPdfSource = string | ArrayBuffer | Blob

export type CwPdfRotation = 0 | 90 | 180 | 270

/** 盖在某一页上的文字。坐标是这一页可视区域的比例。 */
export interface CwPdfNote {
  id: string
  x: number
  y: number
  w: number
  h: number
  text: string
  fontSize: number
}

/** 从 PDF 原文提出来的一段文字。矩阵在页面默认用户空间，不受旋转影响。 */
export interface CwPdfTextRun {
  id: string
  /** 读进来时的文字 */
  source: string
  /** 当前文字。和 source 相同表示还没改过。 */
  text: string
  transform: [number, number, number, number, number, number]
  /** 前进宽度，用户空间 */
  width: number
  /** 字号高度，用户空间 */
  height: number
  /** 原文字体上升高度占字号的比例。编辑时用来对齐可见字高。 */
  ascent?: number
  /** PDF 里的字体族。编辑只改文字，字体沿用这个。 */
  fontFamily?: string
  /** pdf.js 注入的 @font-face 名（loadedName）。编辑叠层必须带上，否则内嵌字会显示成方框。 */
  fontFace?: string
  /** 页面字体的 BaseFont。导出时用它把新字写回原来的字体。 */
  pdfFont?: string
  /** pdf.js 抽出的 Unicode 不可信（缺 ToUnicode），编辑从空字符串开始。 */
  decodeFailed?: boolean
}

export interface CwPdfPage {
  /** 原文件页码，从 0 开始。-1 表示空白页。 */
  sourceIndex: number
  rotation: CwPdfRotation
  notes: CwPdfNote[]
  runs: CwPdfTextRun[]
}

export interface CwPdfDocument {
  pages: CwPdfPage[]
}

export interface CwPdfEditorProps {
  /** 受控文档。传入后以其页面顺序为准，直到 src 再次变化。 */
  modelValue?: CwPdfDocument
  /** 从网址、二进制或 Blob 读入 PDF */
  src?: CwPdfSource | null
  /**
   * preview 只查看。
   * edit 可旋转、调整页序，直接改页面上的原文，也可以另加文字。
   * @default 'edit'
   */
  mode?: 'preview' | 'edit'
  /** 只读查看，效果同 mode="preview" */
  readonly?: boolean
  /**
   * 显示顶部页码和缩放栏。
   * @default true
   */
  showHeader?: boolean
  texts?: Partial<CwPdfEditorTexts>
}

export interface CwPdfEditorTexts {
  loadingText: string
  loadError: string
  pageText: string
  zoomIn: string
  zoomOut: string
  addText: string
  rotate: string
  duplicatePage: string
  addPage: string
  deletePage: string
  moveUp: string
  moveDown: string
  runDecodePlaceholder: string
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwPdfEditorEmits {
  /** v-model:modelValue */
  onModelValueChange?: (document: CwPdfDocument) => void
  onChange?: (document: CwPdfDocument) => void
}

/** defineExpose 暴露的实例 API */
export interface CwPdfEditorHandle {
  toArrayBuffer: () => Promise<ArrayBuffer>
}

export interface CwPdfEditorStyles {
  root: string
  toolbar: string
  pageLabel: string
  actions: string
  action: string
  stage: string
  stack: string
  page: string
  pageSelected: string
  loading: string
  loadingText: string
  note: string
  noteInput: string
  run: string
  runHover: string
  /** 改过的字盖住原文，不带选中边框 */
  runEdited: string
  runInput: string
  statusError: string
}
