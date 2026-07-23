import type { CwImageFitStyles } from './types'

export const defaultStyles: CwImageFitStyles = {
  // 根容器：基础 + 状态
  root: 'cw-image-fit relative w-full h-full overflow-hidden',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 图片包装器：基础（铺满容器，由坐标计算控制居中/位置）
  imageWrapper: 'absolute inset-0',

  // 图片：基础（尺寸和位置通过计算控制）
  image: 'absolute select-none',

  // 加载容器：基础样式
  loadingContainer:
    'absolute inset-0 flex items-center justify-center bg-[var(--bg-color-component)] pointer-events-none',

  // 错误容器：基础样式
  errorContainer:
    'absolute inset-0 flex items-center justify-center bg-[var(--bg-color-component)] pointer-events-none',

  // 错误图标样式配置
  errorIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-placeholder)]',
    size: 3,
  },
}

