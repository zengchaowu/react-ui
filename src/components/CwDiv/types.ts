import type { CSSProperties, ReactNode, UIEventHandler } from 'react'
import type { CwDivScrollbarMap, CwDivTexts } from '@zengchaowu/ui-shared/components/CwDiv/types'

export interface CwDivProps {
  /** 为 true 时完全隐藏自定义滚动条（仅隐藏滚动条轨道与滑块，视口仍可滚动） */
  hideScrollbar?: boolean
  /**
   * 循环列表把同一份内容重复铺开时，用这个映射让滑块表示「在一份里的位置」。
   * 拖动滑块会发出 onScrollbarSeek，由外层把偏移写回中间那一份。
   */
  scrollbarMap?: CwDivScrollbarMap
  /** 为 true 时只要有溢出就常显自定义滚动条（默认仅在滚动/拖拽轨道时显示并淡出） */
  persistScrollbar?: boolean
  /** 追加到视口滚动区域的 class（如 DataTable 表体 overflow 策略） */
  viewportClass?: string
  /**
   * 追加到内容内层的 class（padding / 间距请挂这里）。
   * 勿把 padding 写在根 class：会挤小滚动视口；挂 contentClass 只增加可滚动留白，不裁切内容。
   */
  contentClass?: string
  /** 追加到垂直滚动条轨道 class */
  scrollbarVerticalClass?: string
  texts?: Partial<CwDivTexts>
  /** 拖动滑块时通知外层把偏移写回循环内容 */
  onScrollbarSeek?: (axis: 'vertical' | 'horizontal', offset: number) => void
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onScroll?: UIEventHandler<HTMLDivElement>
}
