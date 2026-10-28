import type { CwExcelWorkbook } from '@zengchaowu/ui-shared/components/CwExcelEditor/types'

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

/** 合并单元格覆盖层片段（与 vue-ui CwExcelEditor/types.ts 对齐） */
export interface ExcelMergePiece {
  key: string
  anchorKey: string
  row: number
  col: number
  showText: boolean
  text: string
  align: 'left' | 'center' | 'right'
  css?: Record<string, string>
  borderShadow?: string
  borderRight?: boolean
  borderBottom?: boolean
  edge: 'body' | 'header'
  style: Record<string, string>
}
