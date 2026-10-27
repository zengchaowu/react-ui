import type { HTMLAttributes, ReactNode } from 'react'
import type { CwEmptyStateAppearance, CwEmptyStateTexts } from '@zengchaowu/ui-shared/components/CwEmptyState/types'

export interface CwEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size'> {
  /** 尺寸（影响默认文案字号与图标间距） */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示文案（未提供 #text 时用 texts.defaultMessage） */
  showText?: boolean
  /** 场景外观；布局用原生 class */
  appearance?: CwEmptyStateAppearance
  texts?: Partial<CwEmptyStateTexts>
  /** `icon` 具名插槽 */
  icon?: ReactNode
  /** `text` 具名插槽 */
  text?: ReactNode
  /** `action` 具名插槽 */
  action?: ReactNode
}
