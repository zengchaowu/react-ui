export interface CwFileUploadStyles {
  /** 根容器：基础样式 */
  root: string
  /** 根容器：状态（互斥） */
  rootNormal: string
  rootDisabled: string
  rootReadonly: string

  /** 上传区域：基础样式 */
  uploadArea: string
  /** 上传区域：状态（互斥） */
  uploadAreaNormal: string
  uploadAreaDisabled: string
  uploadAreaReadonly: string
  /** 上传区域：聚焦环 */
  uploadAreaFocused: string

  /** 文件项：基础样式 */
  fileItem: string
  /** 文件项：状态 */
  fileItemReady: string
  fileItemError: string
  fileItemUploading: string
  fileItemSuccess: string
  /** 文件项：组件状态 */
  fileItemNormal: string
  fileItemDisabled: string
  fileItemReadonly: string

  /** 文件信息 */
  fileInfo: string
  /** 文件预览容器 */
  filePreview: string
  /** 文件预览图片 */
  filePreviewImage: string
  /** 状态覆盖层 */
  fileStatusOverlay: string
  /** 操作按钮容器（完全由外部控制样式） */
  fileActionsContainer: string
  /** 文件名 */
  fileName: string
  /** 加载动画 */
  spinner: string
  /** 删除按钮 */
  deleteButton: string
  /** 删除按钮背景（四分之一圆） */
  deleteButtonBg: string
  /** 删除按钮图标 */
  deleteButtonIcon: string

  /** 错误状态图标样式 */
  errorIcon: string
  /** 删除按钮图标样式 */
  deleteButtonIconStyle: string
  /** 上传图标样式（正常状态） */
  uploadIcon: string
  /** 上传图标样式（禁用状态） */
  uploadIconDisabled: string

  /** 隐藏的文件输入 */
  fileInput: string
}

export interface CwFileUploadTexts {
  delete: string
}

export interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  status: 'ready' | 'uploading' | 'success' | 'failed'
  progress?: number
  url?: string
  error?: string
  file: File
}

export type CwFileUploadAppearance = 'default' | 'dashed' | 'profile'

export interface CwFileUploadProps {
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 是否支持多选 */
  multiple?: boolean
  /** 最大上传数量 */
  maxCount?: number
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 最小文件大小（字节） */
  minSize?: number
  /** 是否显示上传区域 */
  showUploadArea?: boolean
  /** 是否显示删除按钮 */
  deletable?: boolean
  /** 文件列表（v-model） */
  modelValue?: UploadFile[]
  /** 自定义上传函数 */
  upload?: (file: File) => Promise<string>
  /** 文件大小超出限制回调 */
  handleOversize?: (file: File) => void
  /** 文件大小不足回调 */
  handleOverMinSize?: (files: File[]) => boolean
  /** 文件格式错误回调 */
  handleInvalidFormat?: (file: File) => void
  /** 上传成功回调 */
  onSuccess?: (file: UploadFile, response: string) => void
  /** 上传失败回调 */
  onError?: (file: UploadFile, error: Error) => void
  /** 文件删除回调 */
  onRemove?: (file: UploadFile) => void
  /**
   * 外观变体：
   * - `default`：方形上传格
   * - `dashed`：虚线宽条（如壁纸选择）
   * - `profile`：头像上传大格
   */
  appearance?: CwFileUploadAppearance
  /** 文本配置 */
  texts?: Partial<CwFileUploadTexts>
}

export interface CwFileUploadEmits {
  'update:modelValue': [files: UploadFile[]]
  'change': [files: UploadFile[]]
  'success': [file: UploadFile, response: string]
  'error': [file: UploadFile, error: Error]
  'remove': [file: UploadFile]
  'itemClick': [file: UploadFile]
  'retry': [file: UploadFile]
  'preview': [file: UploadFile]
  'select': [files: File[]]
}
