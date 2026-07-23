export type CwTruncateTextPlacement = 'start' | 'end' | 'filename' | 'middle'

/**
 * 外观变体：
 * - `default`：通用截断
 * - `filenameLabel`：附件格文件名 caption 排版
 * - `chipLabel`：行内文件 chip 标签
 * - `fileInfoTitle`：附件预览面板主文件名
 */
export type CwTruncateTextAppearance =
  | 'default'
  | 'filenameLabel'
  | 'chipLabel'
  | 'fileInfoTitle'

export interface CwTruncateTextTexts {}

export interface CwTruncateTextProps {
  /** 展示文本 */
  text: string
  /**
   * 截断策略：
   * - `start` 省略末尾（浏览器默认）；
   * - `end` 省略开头（保留末尾）；
   * - `filename` 按宽度逐级缩略：全名 → 前两字+…+扩展名 → …+扩展名 → 仅扩展名 → 扩展名尾部（RTL）；
   * - `middle` 未溢出显示全名，溢出则中间省略（`…`）。
   */
  placement?: CwTruncateTextPlacement
  /** `placement="middle"` 时根节点 max-width（如 `50%`、`150px`） */
  maxWidth?: string
  /** `placement="filename"` 时保留主体前缀字符数，默认 2 */
  filenameHeadChars?: number
  /** 悬停完整文案，默认与 `text` 相同 */
  title?: string
  /** 根节点标签 */
  tag?: 'span' | 'div'
  /** 场景外观；禁止 styles，布局用原生 class */
  appearance?: CwTruncateTextAppearance
  texts?: Partial<CwTruncateTextTexts>
}

/** 内部结构类 */
export interface CwTruncateTextStyles {
  root: string
  /** `placement="end"` 或文件名 tailRtl 时内层（dir=ltr） */
  inner: string
}
