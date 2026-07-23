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
  styles?: Partial<import('./styles').CwProfileUploaderStyles>
  texts?: Partial<CwProfileUploaderTexts>
}

export interface CwProfileUploaderEmits {
  'update:modelValue': [value: import('../CwFileUpload/types').UploadFile[]]
  change: [value: import('../CwFileUpload/types').UploadFile[]]
}

