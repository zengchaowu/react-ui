import type { CropCoordinates } from '@zengchaowu/ui-shared/components/CwImageCropper/functions/cropCoordinates'
import type { CwImageCropperTexts } from '@zengchaowu/ui-shared/components/CwImageCropper/types'

/** 用户已确认裁剪框；Blob 可稍后导出 */
export interface CwImageCropExportRequest {
  image: HTMLImageElement
  cropCoords: CropCoordinates
  outputFormat: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  maxEdge?: number
  maxBytes?: number
}

export interface CwImageCropperProps {
  /** 要裁剪的图片文件 */
  file?: File
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
  /** 输出体积上限（字节）；仅 JPEG/WebP 会降质量 */
  maxBytes?: number
  /**
   * 为 false 时确认只抛出 `confirm`，由调用方自行导出 Blob。
   * 默认 true：确认后在组件内导出并抛出 `crop`。
   */
  exportOnConfirm?: boolean
  texts?: Partial<CwImageCropperTexts>
  /** 用户点击确认（对应 Vue `@confirm`） */
  onConfirm?: (request: CwImageCropExportRequest) => void
  /** 裁剪完成（对应 Vue `@crop`） */
  onCrop?: (blob: Blob) => void
  /** 取消（对应 Vue `@cancel`） */
  onCancel?: () => void
  /** 错误（对应 Vue `@error`） */
  onError?: (error: Error) => void
}

export interface CwImageCropperEmits {
  /** 用户点击确认，裁剪框已确定。可先关层，再异步导出。 */
  'confirm': [request: CwImageCropExportRequest]
  /** 裁剪完成事件，返回裁剪后的 Blob */
  'crop': [blob: Blob]
  /** 取消事件 */
  'cancel': []
  /** 错误事件 */
  'error': [error: Error]
}

/** 等价 Vue `defineExpose` 的命令式句柄 */
export interface CwImageCropperHandle {
  /** 触发确认裁剪（同点击确认按钮） */
  crop: () => Promise<void>
  /** 重置裁剪框与图片变换 */
  reset: () => void
}
