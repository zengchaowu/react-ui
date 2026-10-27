import type { HTMLAttributes } from 'react'
import type { CwPptDeck, CwPptSource, CwPptEditorTexts } from '@zengchaowu/ui-shared/components/CwPptEditor/types'

export interface CwPptEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'>,
    CwPptEditorEmits {
  /** 受控幻灯片。传入后以其为准，直到 src 再次变化。 */
  modelValue?: CwPptDeck
  /** 从网址、二进制或 Blob 读入 pptx */
  src?: CwPptSource | null
  /**
   * preview 只查看。
   * edit 可改文字、移动文字框，并增删幻灯片。
   * @default 'edit'
   */
  mode?: 'preview' | 'edit'
  /** 只读查看，效果同 mode="preview" */
  readonly?: boolean
  texts?: Partial<CwPptEditorTexts>
  /** 根容器额外 class（对应 Vue attrs.class） */
  className?: string
}

export interface CwPptEditorEmits {
  /** 对应 Vue `update:modelValue` */
  onModelValueChange?: (deck: CwPptDeck) => void
  /** 对应 Vue `change` */
  onChange?: (deck: CwPptDeck) => void
}

/** defineExpose 对应的 imperative handle */
export interface CwPptEditorHandle {
  toArrayBuffer: () => Promise<ArrayBuffer>
}
