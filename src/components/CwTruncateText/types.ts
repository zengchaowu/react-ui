import type { HTMLAttributes } from 'react'
import type { CwTruncateTextPlacement, CwTruncateTextAppearance, CwTruncateTextTexts } from '@zengchaowu/ui-shared/components/CwTruncateText/types'

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
  /**
   * 是否启用内置截断 tooltip（默认 true）。
   * 外层已提供整颗 chip / 整行的提示（如文件引用 chip 的完整路径 tooltip）时传 false，避免同时出现两层提示。
   */
  showTooltip?: boolean
  /** 根节点标签 */
  tag?: 'span' | 'div'
  /** 场景外观；布局用原生 class */
  appearance?: CwTruncateTextAppearance
  texts?: Partial<CwTruncateTextTexts>
}
