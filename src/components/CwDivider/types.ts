import type { HTMLAttributes, ReactNode } from 'react'
import type { CwDividerLayout, CwDividerContentPosition, CwDividerTexts } from '@zengchaowu/ui-shared/components/CwDivider/types'

export interface CwDividerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 垂直分割（有文案时忽略文案，仍画竖线） */
  vertical?: boolean
  /**
   * 是否显示
   * @default true
   */
  show?: boolean
  /** `show` 别名；传入时优先于 `show` */
  open?: boolean
  /**
   * 发丝线（0.5px）；`false` 为 1px
   * @default true
   */
  hairline?: boolean
  /**
   * - `standalone`：文档流内容分割
   * - `embedded`：仅根节点 + 外层 `class`（如 Cell 下划线，线由外层 hairline 定义）
   */
  layout?: CwDividerLayout
  /** 虚线 */
  dashed?: boolean
  /**
   * 中间文案（与 `text` / `label` 同义；默认插槽优先）
   */
  content?: string
  /** `content` 别名 */
  text?: string
  /** `content` 别名 */
  label?: string
  /**
   * 文案相对两侧短线的位置
   * @default 'center'
   */
  contentPosition?: CwDividerContentPosition
  /** 紧凑间距（仅带文案时） */
  dense?: boolean
  /** 文案加粗 */
  bold?: boolean
  /** 禁用色（线仍用 `--border-color`，文案用 disabled token） */
  disabled?: boolean
  texts?: Partial<CwDividerTexts>
  /** 默认插槽：自定义文案节点，优先于 `content` / `text` / `label` */
  children?: ReactNode
}
