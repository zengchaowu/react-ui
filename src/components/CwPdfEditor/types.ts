import type { CwPdfDocument } from '@zengchaowu/ui-shared/components/CwPdfEditor/types'

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
