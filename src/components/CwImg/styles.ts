import type { CwImgStyles } from './types'

export const imgBase: CwImgStyles = {
  // 根容器：基础样式
  root: 'cw-img relative flex items-center justify-center overflow-hidden w-full h-full',

  // 图片：基础样式（禁止拖出为文件/新标签，避免聊天内误拖）
  image: 'block w-full h-full object-cover [-webkit-user-drag:none]',

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
