import type { CwResizeFrameTexts, CwResizeFrameSize } from '@zengchaowu/ui-shared/components/CwResizeFrame/types'

export interface CwResizeFrameProps {
  width: number
  height: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  resizeWidth?: boolean
  resizeHeight?: boolean
  disabled?: boolean
  showSize?: boolean
  texts?: Partial<CwResizeFrameTexts>
  /** 等价 Vue `@update:width` */
  onWidthChange?: (value: number) => void
  /** 等价 Vue `@update:height` */
  onHeightChange?: (value: number) => void
  /** 等价 Vue `@resize` */
  onResize?: (payload: CwResizeFrameSize) => void
}

/** 等价 Vue `CwResizeFrameEmits` */
export interface CwResizeFrameEmits {
  'update:width': (value: number) => void
  'update:height': (value: number) => void
  resize: (payload: CwResizeFrameSize) => void
}
