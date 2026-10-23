export interface CwImageCropperSheetProps {
  /** 裁剪框的宽高比，例如 [1, 1] 表示正方形 */
  aspectRatio?: [number, number]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 输出图片质量（0-1） */
  quality?: number
  /** 输出图片格式 */
  outputFormat?: 'image/png' | 'image/jpeg' | 'image/webp'
  /** 输出长边上限（像素） */
  maxEdge?: number
  /** 输出体积上限（字节） */
  maxBytes?: number
  /** 自定义文本 */
  texts?: Partial<CwImageCropperSheetTexts>
  /** 用户已确认，弹层开始关闭，Blob 尚未导出 */
  onAccept?: () => void
  /** 裁剪完成事件，返回裁剪后的 Blob */
  onCrop?: (blob: Blob) => void
  /** 取消事件 */
  onCancel?: () => void
  /** 错误事件 */
  onError?: (error: Error) => void
}

export interface CwImageCropperSheetTexts {}

export interface CwImageCropperSheetEmits {
  /** 用户已确认，弹层开始关闭，Blob 尚未导出 */
  'accept': []
  /** 裁剪完成事件，返回裁剪后的 Blob */
  'crop': [blob: Blob]
  /** 取消事件 */
  'cancel': []
  /** 错误事件 */
  'error': [error: Error]
}

export interface CwImageCropperSheetMethods {
  /** 显示图片裁剪 Sheet，选择图片后进行裁剪 */
  show: () => Promise<void>
}

/** 等价 Vue `defineExpose` 的命令式句柄 */
export type CwImageCropperSheetHandle = CwImageCropperSheetMethods
