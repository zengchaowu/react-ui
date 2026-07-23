export interface CwVoiceWaveformProps {
  /** 每根柱高度比例 0~1；未传或为空时回退装饰性动画 */
  levels?: number[]
  barCount?: number
  minHeightRatio?: number
  maxHeightRatio?: number
  barClass?: string
  rootClass?: string
}
