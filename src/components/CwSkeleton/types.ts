import type { HTMLAttributes } from 'react'
import type { CwSkeletonTexts } from '@zengchaowu/ui-shared/components/CwSkeleton/types'

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

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSkeletonEmits {
  // 骨架屏是展示组件，不需要事件
}
