/** 单元格值。空单元格为 null。公式不进入这个模型。 */
export type CwExcelCellValue = string | number | boolean | null

/** 单元格某一边的边框。没有这条边时不画，沿用表格默认细线。 */
export interface CwExcelBorderEdge {
  style: 'hair' | 'thin' | 'dashed' | 'dotted' | 'medium' | 'thick' | 'double'
  /** #RRGGBB */
  color: string
}

export interface CwExcelCellBorders {
  left?: CwExcelBorderEdge
  right?: CwExcelBorderEdge
  top?: CwExcelBorderEdge
  bottom?: CwExcelBorderEdge
}

/** 从 xlsx 读到的单元格样式。缺省字段沿用表格默认。 */
export interface CwExcelCellStyle {
  /** 文字颜色 #RRGGBB */
  color?: string
  /** 填充色 #RRGGBB */
  fill?: string
  bold?: boolean
  align?: 'left' | 'center' | 'right'
  /** 字号，磅 */
  fontSize?: number
  border?: CwExcelCellBorders
}

/** 合并区域。值只放在左上角，被盖住的格子为空。 */
export interface CwExcelMerge {
  /** 锚点行，从 0 开始 */
  row: number
  /** 锚点列，从 0 开始 */
  col: number
  rowspan: number
  colspan: number
}

export interface CwExcelSheet {
  /** 工作表名 */
  name: string
  /** 行优先的矩形单元格 */
  cells: CwExcelCellValue[][]
  /** 合并区域。坐标用整张表的行和列，不随表头模式改变。 */
  merges: CwExcelMerge[]
  /** 列宽，像素。0 或缺省表示用默认列宽。 */
  colWidths?: number[]
  /** 行高，像素。0 或缺省表示用默认行高。 */
  rowHeights?: number[]
  /** 与 cells 对齐的样式。空位为 null。 */
  styles?: (CwExcelCellStyle | null)[][]
}

export interface CwExcelWorkbook {
  sheets: CwExcelSheet[]
}

/** xlsx / csv 来源。字符串按 URL 拉取。 */
export type CwExcelSource = string | ArrayBuffer | Blob

export interface CwExcelEditorProps {
  /** 受控工作簿。传入后以其为准，直到 src 再次变化。 */
  modelValue?: CwExcelWorkbook
  /** 从文件、二进制或 URL 读入 xlsx / csv */
  src?: CwExcelSource | null
  /** src 无法从文件名判断格式时使用，例如 csv */
  fileName?: string
  /** 当前工作表下标 */
  activeSheet?: number
  /**
   * 把首行当作列标题，表体从第二行开始。
   * 关闭后列标题为 A、B、C，全部行都可编辑。
   * @default true
   */
  headerRow?: boolean
  /**
   * preview 只查看，不能改单元格，也不显示添加行、列、工作表。
   * edit 可编辑。
   * @default 'edit'
   */
  mode?: 'preview' | 'edit'
  /** 只读查看，效果同 mode="preview" */
  readonly?: boolean
  texts?: Partial<CwExcelEditorTexts>
}

export interface CwExcelEditorTexts {
  emptyText: string
  loadingText: string
  loadError: string
  addSheet: string
  cut: string
  copy: string
  paste: string
  clear: string
  insertRowAbove: string
  insertRowBelow: string
  insertColLeft: string
  insertColRight: string
  deleteRow: string
  deleteColumn: string
  insertSheet: string
  deleteSheet: string
  renameSheet: string
  duplicateSheet: string
  undo: string
  redo: string
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwExcelEditorEmits {
  /** v-model:modelValue */
  onModelValueChange?: (workbook: CwExcelWorkbook) => void
  /** v-model:activeSheet */
  onActiveSheetChange?: (index: number) => void
  onChange?: (workbook: CwExcelWorkbook) => void
}

/** defineExpose 暴露的实例 API */
export interface CwExcelEditorHandle {
  getWorkbook: () => CwExcelWorkbook
  undo: () => void
  redo: () => void
  toBlob: () => Promise<Blob>
  toArrayBuffer: () => Promise<ArrayBuffer>
}

export interface CwExcelEditorStyles {
  root: string
  toolbar: string
  sheetBar: string
  sheets: string
  sheet: string
  sheetActive: string
  sheetRename: string
  actions: string
  action: string
  table: string
  statusError: string
  formulaBar: string
  nameBox: string
  formulaFx: string
  formulaInput: string
  cellSelected: string
  cellText: string
  cellSpill: string
  cellPlaceholder: string
  cellTextRight: string
  cellTextCenter: string
  cellInput: string
  cellInputRight: string
  cellInputCenter: string
  rowIndex: string
  axis: string
  rowResize: string
  axisSelected: string
  mergeLayer: string
  mergeCell: string
  mergeSelected: string
}
