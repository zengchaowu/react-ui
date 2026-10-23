import type { HTMLAttributes } from 'react'

export interface CwVoiceWaveformProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 每根柱高度比例 0~1；未传或为空时回退装饰性动画 */
  levels?: number[]
  /** 柱数量 */
  barCount?: number
  /** 单根柱宽度（px） */
  barWidth?: number
  /** 柱间距（px） */
  barGap?: number
  /** 波形区域高度（rem） */
  height?: number
  /** 柱最小高度比例（0~1），装饰动画与 levels 模式共用 */
  minHeightRatio?: number
  /** 柱最大高度比例（0~1），装饰动画与 levels 模式共用 */
  maxHeightRatio?: number
  /** 柱额外 class（颜色、圆角等；宽度建议用 barWidth） */
  barClass?: string
  rootClass?: string
}
