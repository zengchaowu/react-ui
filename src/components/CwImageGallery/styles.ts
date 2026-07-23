import type { CwImageGalleryStyles } from './types'

export const defaultStyles: CwImageGalleryStyles = {
  // 根容器：基础 + 状态
  root: 'cw-image-gallery relative w-full h-full overflow-hidden',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 容器：基础
  container: 'relative w-full h-full overflow-hidden',

  // 滚动容器：基础
  scrollContainer: 'w-full h-full',

  // 图片项：基础
  imageItem: 'w-full h-full',

  // 指示器
  indicator: 'absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center',
}

