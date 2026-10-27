
import type { CwImgTexts } from '@zengchaowu/ui-shared/components/CwImg/types'

export interface CwImgProps {
  /** 图片地址 */
  src?: string
  /** 图片替代文本 */
  alt?: string
  /**
   * 原生 `loading`：与 `loadWhenVisible` 叠加；首屏图可设 `eager` 并关闭 `loadWhenVisible`
   */
  imgLoading?: 'eager' | 'lazy'
  /** 进入视口（含 rootMargin）后再设置 src；默认开启 */
  loadWhenVisible?: boolean
  /** IntersectionObserver rootMargin */
  loadWhenVisibleRootMargin?: string
  texts?: Partial<CwImgTexts>
  /** 图片加载错误事件 */
  onError?: () => void
}
