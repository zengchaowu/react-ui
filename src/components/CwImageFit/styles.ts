import type { CwImageFitStyles, CwImageFitAppearance } from './types'

export const imageFitBase: CwImageFitStyles = {
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
    class: 'inline-flex items-center justify-center text-[var(--text-color-placeholder)]',
    size: 3,
  },
}

/** 消息行内图片 chip（bounded + 随内容收缩） */
export const imageFitInlineChipAppearance: Partial<CwImageFitStyles> = {
  root: 'cw-image-fit relative inline-block shrink-0 overflow-hidden align-middle',
  imageWrapper: 'block leading-none',
  image: 'block select-none',
  loadingContainer: 'pointer-events-none absolute inset-0 opacity-0',
  errorContainer:
    'pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--bg-color-secondarycontainer)]',
  errorIconStyles: {
    class: 'inline-flex items-center justify-center text-[var(--text-color-placeholder)]',
    size: 1.25,
  },
}

export type { CwImageFitAppearance } from './types'

export function resolveImageFitStyles(
  appearance: CwImageFitAppearance = 'default',
): CwImageFitStyles {
  if (appearance === 'inline-chip') {
    return { ...imageFitBase, ...imageFitInlineChipAppearance }
  }
  return imageFitBase
}
