import type { ReactNode } from 'react'
import type { CwGridProps as CwGridPropsBase } from '@zengchaowu/ui-shared/components/CwGrid/types'

export * from '@zengchaowu/ui-shared/components/CwGrid/types'

export interface CwGridProps extends CwGridPropsBase {
  /** 默认插槽内容，每个子节点自动成为一列 */
  children?: ReactNode
  className?: string
}
