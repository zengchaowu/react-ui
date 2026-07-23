export interface TpCodePreviewProps {
  /**
   * 代码内容
   */
  code: string
  /**
   * 代码语言
   */
  language?: string
  /**
   * 标题
   */
  title?: string
  /**
   * 是否可复制
   */
  copyable?: boolean
}

export interface TpCodePreviewStyles {
  root: string;
  header: string;
  headerLeft: string;
  title: string;
  headerRight: string;
  button: string;
  buttonPrimary: string;
  content: string;
  editor: string;
  editorHeader: string;
  editorTitle: string;
  editorContent: string;
  preview: string;
  previewHeader: string;
  previewTitle: string;
  previewContent: string;
  iframe: string;
  loading: string;
  loadingSpinner: string;
  loadingText: string;
  error: string;
  errorIcon: string;
  errorText: string;
  retryButton: string;
  toolbar: string;
  toolbarButton: string;
  toolbarButtonActive: string;
}

export interface TpCodePreviewTexts {
  title?: string;
  copyButton?: string;
  saveButton?: string;
  errorText?: string;
  retryText?: string;
  editorTitle?: string;
  previewTitle?: string;
  run?: string;
  stop?: string;
  clear?: string;
  save?: string;
  copy?: string;
  format?: string;
  fullscreen?: string;
  exitFullscreen?: string;
  loading?: string;
  error?: string;
  retry?: string;
  runSuccess?: string;
  runError?: string;
  syntaxError?: string;
  runtimeError?: string;
  timeout?: string;
  noCode?: string;
  placeholder?: string;
  language?: string;
  theme?: string;
  fontSize?: string;
}