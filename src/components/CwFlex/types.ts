import type { CSSProperties, ReactNode } from 'react'
import type { CwFlexDirection, CwFlexAlign, CwFlexJustify, CwFlexTexts } from '@zengchaowu/ui-shared/components/CwFlex/types'

export interface CwFlexProps {
  /** 主轴方向 */
  direction?: CwFlexDirection
  /** 子项间距（px） */
  gap?: number
  /** 内边距（px） */
  padding?: number
  /** 交叉轴对齐 */
  align?: CwFlexAlign
  /** 主轴对齐 */
  justify?: CwFlexJustify
  texts?: Partial<CwFlexTexts>
  children?: ReactNode
  className?: string
  style?: CSSProperties
}
