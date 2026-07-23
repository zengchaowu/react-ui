import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwImgStyles {
  /** 根容器：基础样式 */
  root: string
  /** 图片：基础样式 */
  image: string
  /** 加载容器：基础样式 */
  loadingContainer: string
  /** 错误容器：基础样式 */
  errorContainer: string
  /** CwIcon 样式配置（错误图标） */
  errorIconStyles?: CwIconEmbed
}

export interface CwImgTexts {
  /** 加载失败区域的无障碍说明 */
  errorAriaLabel: string
}

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
  /** 自定义样式 */
  styles?: Partial<CwImgStyles>
  texts?: Partial<CwImgTexts>
}

export interface CwImgEmits {
  /** 图片加载错误事件 */
  error: []
}

