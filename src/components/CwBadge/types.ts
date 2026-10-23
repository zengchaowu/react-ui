import type { HTMLAttributes, ReactNode } from 'react'

/**
 * 外观变体：
 * - `default`：标准角标（叠在插槽内容右上角）
 * - `avatarUnread`：头像角未读（略内收 + 更小红点）
 */
export type CwBadgeAppearance = 'default' | 'corner-dot'

export interface CwBadgeStyles {
  root: string
  rootWithSlot: string
  badgeOverlay: string
  content: string
  text: string
  dot: string
  xsmall: string
  small: string
  medium: string
  large: string
}

export interface CwBadgeTexts {}

export interface CwBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'size' | 'content'> {
  content?: string | number
  dot?: boolean
  max?: number
  showZero?: boolean
  size?: 'xsmall' | 'small' | 'medium' | 'large'
  backgroundColor?: string
  appearance?: CwBadgeAppearance
  texts?: Partial<CwBadgeTexts>
  /** 默认插槽：角标叠放的内容 */
  children?: ReactNode
}

export interface CwBadgeEmits {}

/** Tabs 等场景可传的 Badge 配置（不含 styles） */
export type CwBadgeOptions = Pick<
  CwBadgeProps,
  'content' | 'dot' | 'max' | 'showZero' | 'size' | 'backgroundColor' | 'appearance'
>
