import type { CwDividerStyles } from './types'

export const defaultStyles: CwDividerStyles = {
  root: 'cw-divider bg-[var(--bg-color-component)]',
  horizontal: 'w-full h-px',
  vertical: 'h-full w-px',

  /**
   * 「头发丝」分割线实现原理：
   * 利用 CSS transform: scaleY(0.5) / scaleX(0.5) 将 1px 压缩为 0.5px 物理像素，
   * 在 Retina 屏上呈现比 1px 更细腻的线条效果。
   * 同时配合 transform-origin 避免缩放导致偏移。
   */
  hairlineHorizontal: 'w-full h-px scale-y-50 origin-top',
  hairlineVertical: 'h-full w-px scale-x-50 origin-left',
}
