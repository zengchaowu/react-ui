import type { HTMLAttributes, ReactNode } from 'react'
import type { CwBadgeAppearance, CwBadgeTexts } from '@zengchaowu/ui-shared/components/CwBadge/types'

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

/** Tabs 等场景可传的 Badge 配置（不含 styles） */
export type CwBadgeOptions = Pick<
  CwBadgeProps,
  'content' | 'dot' | 'max' | 'showZero' | 'size' | 'backgroundColor' | 'appearance'
>
