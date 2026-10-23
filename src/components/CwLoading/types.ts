import type { HTMLAttributes } from 'react'

/**
 * 外观变体：
 * - `default`：品牌色 spinner
 * - `currentColor`：继承 `currentColor`（按钮内联 loading）
 * - `inverse`：反色 spinner（品牌底按钮）；可用 `--cw-loading-inverse-fg` 覆盖前景
 * - `inverseTiny`：反色小 spinner（底栏主按钮等）
 * - `treeInline`：树懒加载展开位（12px 占位，品牌色）
 * - `mutedInline`：紧凑灰 spinner（会话 tab 等次要位）
 * - `inlineText`：行内文本旁保存态（0.75em，随字号缩放）
 */
export type CwLoadingAppearance =
  | 'default'
  | 'currentColor'
  | 'inverse'
  | 'inverseTiny'
  | 'treeInline'
  | 'mutedInline'
  | 'inlineText'

export interface CwLoadingStyles {
  root: string
  loader: string
  spinner: string
  spinnerCircle: string
  dots: string
  dot: string
  bars: string
  bar: string
  small: string
  medium: string
  large: string
}

export interface CwLoadingTexts {}

export interface CwLoadingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size' | 'type'> {
  type?: 'spinner' | 'dots' | 'bars'
  size?: 'small' | 'medium' | 'large'
  appearance?: CwLoadingAppearance
  /** 附加到 spinner 圆环（非 root） */
  spinnerClass?: string
  texts?: Partial<CwLoadingTexts>
}

export interface CwLoadingEmits {}
