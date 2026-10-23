import type { HTMLAttributes } from 'react'

export interface CwIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'size'> {
  /** iconfont 图标类名（如 `common--nav--folder` 或完整 `icon-common--nav--folder`） */
  name?: string
  /**
   * 渲染模式：
   * - `font`：字体（单色，默认）
   * - `symbol`：iconfont Symbol（`<use href="#icon-xxx">`，保留多色）
   */
  mode?: 'font' | 'symbol'
  /** 是否旋转（用于加载动画） */
  spin?: boolean
  /** iconfont 前缀（用于 iconfont，如 'icon'） */
  prefix?: string
  /**
   * 边长（rem）；`0` 表示尺寸由 em/CSS 承担。
   * 默认 `1`。
   */
  size?: number
  /** 自定义文本 */
  texts?: Partial<CwIconTexts>
}

export interface CwIconTexts {
  /** 图标描述（用于无障碍访问） */
  label?: string
}

/** 其它组件内嵌 Icon 时的精简配置 */
export interface CwIconEmbed {
  size?: number
  class?: string
}
