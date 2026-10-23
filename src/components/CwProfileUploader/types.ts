import type { UploadFile } from '../CwFileUpload/types'

export interface CwProfileUploaderTexts {
  /** 预览头像 `img` 的 alt */
  previewImageAlt: string
}

export interface CwProfileUploaderProps {
  accept?: string
  multiple?: boolean
  maxCount?: number
  maxSize?: number
  minSize?: number
  /** 必传：上传实现，返回文件可访问地址 */
  upload: (file: File) => Promise<string>
  profileImage?: string
  disabled?: boolean
  readonly?: boolean
  /** 是否显示删除按钮 */
  deletable?: boolean
  texts?: Partial<CwProfileUploaderTexts>
  /** 文件列表变化（对应 Vue `update:modelValue` / `change`） */
  onChange?: (value: UploadFile[]) => void
  /** 透传到 CwFileUpload 根节点 */
  className?: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwProfileUploaderEmits {
  'update:modelValue': [value: import('../CwFileUpload/types').UploadFile[]]
  change: [value: import('../CwFileUpload/types').UploadFile[]]
}
