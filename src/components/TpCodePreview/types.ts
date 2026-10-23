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
  /**
   * 额外 class
   */
  className?: string
}
