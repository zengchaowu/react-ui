import type { HTMLAttributes, ReactNode } from 'react'
import type { UploadFile, CwFileUploadAppearance, CwFileUploadTexts } from '@zengchaowu/ui-shared/components/CwFileUpload/types'

export interface CwFileUploadProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'onChange' | 'onSelect' | 'onError' | 'onRemove'
  > {
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
  value?: UploadFile[]
  /** 自定义上传函数 */
  upload?: (file: File) => Promise<string>
  /** 文件大小超出限制回调 */
  handleOversize?: (file: File) => void
  /** 文件大小不足回调 */
  handleOverMinSize?: (files: File[]) => boolean
  /** 文件格式错误回调 */
  handleInvalidFormat?: (file: File) => void
  /**
   * 外观变体：
   * - `default`：方形上传格
   * - `dashed`：虚线宽条（如壁纸选择）
   * - `profile`：头像上传大格
   */
  appearance?: CwFileUploadAppearance
  /** 文本配置 */
  texts?: Partial<CwFileUploadTexts>
  /** 自定义上传区域内容（对应 Vue `#uploadArea` 插槽） */
  uploadArea?: ReactNode
  /** 文件项操作区（对应 Vue `#actions` 具名插槽，参数为当前文件） */
  actions?: (file: UploadFile) => ReactNode
  /** 文件列表变化（对应 Vue `update:modelValue` / `change`） */
  onChange?: (files: UploadFile[]) => void
  /** 上传成功回调 */
  onSuccess?: (file: UploadFile, response: string) => void
  /** 上传失败回调 */
  onError?: (file: UploadFile, error: Error) => void
  /** 文件删除回调 */
  onRemove?: (file: UploadFile) => void
  /** 文件项点击 */
  onItemClick?: (file: UploadFile) => void
  /** 重试上传 */
  onRetry?: (file: UploadFile) => void
  /** 预览文件 */
  onPreview?: (file: UploadFile) => void
  /** 选择文件（对应 Vue `select` 事件） */
  onSelect?: (files: File[]) => void
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface CwFileUploadHandle {
  /** 触发文件选择 */
  chooseFile: () => void
  /** 获取当前文件列表 */
  getFileList: () => UploadFile[]
  /** 清空文件列表 */
  clearFilesList: () => void
  /** 删除文件 */
  remove: (file: UploadFile) => void
  /** 重试上传 */
  retry: (file: UploadFile) => void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
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
