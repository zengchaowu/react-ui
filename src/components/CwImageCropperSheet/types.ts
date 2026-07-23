import type { CwImageCropperStyles, CwImageCropperProps } from '../CwImageCropper/types'
import type { CwDynamicSheetInnerStyles } from '../CwDynamicSheet/types'

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
  /** CwImageCropper 自定义样式 */
  cropperStyles?: Partial<CwImageCropperStyles>
  /** CwDynamicSheet 自定义样式 */
  sheetStyles?: Partial<CwDynamicSheetInnerStyles>
  /** 自定义样式 */
  styles?: Partial<CwImageCropperSheetStyles>
  /** 自定义文本 */
  texts?: Partial<CwImageCropperSheetTexts>
}

export interface CwImageCropperSheetStyles {
  contentWrapper: string
}

export interface CwImageCropperSheetTexts {
}

export interface CwImageCropperSheetEmits {
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

