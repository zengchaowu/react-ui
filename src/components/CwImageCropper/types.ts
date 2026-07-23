export interface CwImageCropperTexts {
  cancelAriaLabel: string
  confirmAriaLabel: string
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
  /** 自定义样式 */
  styles?: Partial<CwImageCropperStyles>
  texts?: Partial<CwImageCropperTexts>
}

export interface CwImageCropperStyles {
  root: string
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string
  container: string
  containerNormal?: string
  containerDisabled?: string
  containerReadonly?: string
  imageWrapper: string
  image: string
  imageFitRoot: string
  cropBox: string
  cropBoxNormal?: string
  cropBoxDisabled?: string
  cropBoxReadonly?: string
  cropHandle: string
  cropHandleNormal?: string
  cropHandleDisabled?: string
  cropHandleReadonly?: string
  cropHandleInner?: string
  confirmButton: string
  confirmButtonNormal?: string
  confirmButtonDisabled?: string
  confirmButtonReadonly?: string
  cancelButton: string
  cancelButtonNormal?: string
  cancelButtonDisabled?: string
  cancelButtonReadonly?: string
  overlay: string
}

export interface CwImageCropperEmits {
  /** 裁剪完成事件，返回裁剪后的 Blob */
  'crop': [blob: Blob]
  /** 取消事件 */
  'cancel': []
  /** 错误事件 */
  'error': [error: Error]
}

