// 文档源类型
export interface DocumentSource {
  url?: string
  file?: File
  arrayBuffer?: ArrayBuffer
  blob?: Blob
}

// 组件 Props 接口
export interface TpOfficePreviewProps {
  // 文档源，可以是 URL 字符串或包含 url/file 的对象
  src?: string | DocumentSource
  // 文件类型，优先级高于从URL解析的类型
  // 可选值: 'pdf', 'docx', 'xlsx', 'pptx', 'csv'
  fileType?: string
  // 是否显示重试按钮
  showRetry?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<TpOfficePreviewStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<TpOfficePreviewTexts>
}

export interface TpOfficePreviewStyles {
  root: string
  loadingContainer: string
  loadingContent: string
  loadingSpinner: string
  loadingText: string
  errorContainer: string
  errorContent: string
  errorIcon: string
  errorIconSvg: string
  errorTitle: string
  errorMessage: string
  retryButton: string
  previewContainer: string
  toolbar: string
  toolbarLeft: string
  toolbarRight: string
  toolbarButton: string
  toolbarButtonActive: string
  toolbarButtonDisabled: string
  unsupportedContainer: string
  unsupportedContent: string
  unsupportedIcon: string
  unsupportedIconSvg: string
  unsupportedTitle: string
  unsupportedMessage: string
}

export interface TpOfficePreviewTexts {
  loadingComponent: string
  loadingDocument: string
  errorTitle: string
  retryText: string
  downloadText: string
  printText: string
  fullscreenText: string
  exitFullscreenText: string
  zoomInText: string
  zoomOutText: string
  resetZoomText: string
  previousPageText: string
  nextPageText: string
  pageText: string
}

// 组件 Emits 接口
export interface TpOfficePreviewEmits {
  // 文档渲染完成事件
  rendered: []
  // 错误事件
  error: [message: string]
  // 文档加载开始事件
  loading: []
}