import type { HTMLAttributes } from 'react'

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
  | 'filename'
  | 'chip'
  | 'title-line'

export interface CwTruncateTextTexts {}

export interface CwTruncateTextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** 展示文本 */
  text: string
  /**
   * 截断策略：
   * - `start` 省略末尾（浏览器默认）；
   * - `end` 省略开头（保留末尾）；
   * - `filename` 按宽度缩略并尽量铺满：全名 → 前缀…扩展名 → …扩展名 → 扩展名 → RTL 尾部；
   * - `middle` 未溢出显示全名，溢出则中间省略（`…`）。
   */
  placement?: CwTruncateTextPlacement
  /** `placement="middle"` 时根节点 max-width（如 `50%`、`150px`） */
  maxWidth?: string
  /** `placement="filename"` 缩略时至少保留的主体前缀字符数，默认 2 */
  filenameHeadChars?: number
  /** 截断时悬停提示文案；默认与 `text` 相同。未截断时不显示 tooltip */
  title?: string
  /** 根节点标签 */
  tag?: 'span' | 'div'
  /** 场景外观；布局用原生 class */
  appearance?: CwTruncateTextAppearance
  texts?: Partial<CwTruncateTextTexts>
}

/** 内部结构类 */
export interface CwTruncateTextStyles {
  root: string
  /** `placement="end"` 或文件名 tailRtl 时内层（dir=ltr） */
  inner: string
}
