import type { HTMLAttributes } from 'react'

export interface CwSkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 骨架屏形状 */
  shape?: 'circle' | 'rect' | 'rounded'
  /** 骨架屏宽度 */
  width?: string | number
  /** 骨架屏高度 */
  height?: string | number
  /** 是否显示动画 */
  animated?: boolean
  /** 自定义文本对象 */
  texts?: Partial<CwSkeletonTexts>
}

export interface CwSkeletonStyles {
  /** 根容器基础样式 */
  root: string
  /** 圆形样式 */
  circle: string
  /** 矩形样式 */
  rect: string
  /** 圆角矩形样式 */
  rounded: string
  /** 动画样式 */
  animated: string
}

export interface CwSkeletonTexts {
  /** 骨架屏 aria-label */
  label: string
}
