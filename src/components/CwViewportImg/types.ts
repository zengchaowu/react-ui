export interface CwViewportImgProps {
  src?: string
  alt?: string
  /** 进入视口（含 rootMargin）后再设置 src；默认开启 */
  loadWhenVisible?: boolean
  /** IntersectionObserver rootMargin */
  loadWhenVisibleRootMargin?: string
}
