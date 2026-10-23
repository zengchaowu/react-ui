import type { ImgHTMLAttributes } from 'react'

export interface CwViewportImgProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string
  alt?: string
  /** 进入视口（含 rootMargin）后再设置 src；默认开启 */
  loadWhenVisible?: boolean
  /** IntersectionObserver rootMargin */
  loadWhenVisibleRootMargin?: string
}
