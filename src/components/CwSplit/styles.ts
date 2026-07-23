import type { CwSplitStyles } from './types'

export const defaultStyles: CwSplitStyles = {
  // 根容器
  root: 'cw-split relative flex w-full h-full',

  // 第一个面板
  first: 'flex h-full min-h-0 shrink-0 flex-col overflow-hidden',

  // 分隔条：宽热区由 CwSplit 内联宽高控制；z-index 与纵向一致，避免与横向观感/层叠不一致
  divider:
    'z-[var(--z-index-float)] flex-shrink-0 relative transition-colors duration-200 cursor-col-resize',
  dividerDragging: '',

  // 分隔条中心线：宽高由内联控制为 1px，此处只负责定位层叠与过渡（勿加 border，避免视觉上变粗）
  dividerHandle:
    'absolute flex items-center justify-center transition-colors duration-200 bg-[var(--border-color-light)]',

  // 第二个面板：纵向 flex，便于 slot 内 flex-1 消息区 + 底部输入区撑满高度
  second: 'flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden'
}

// 垂直布局的样式覆盖（与 default 除 cursor 外保持一致）
export const verticalStyles: Partial<CwSplitStyles> = {
  root: 'cw-split relative flex flex-col w-full h-full',
  divider:
    'z-[var(--z-index-float)] flex-shrink-0 relative transition-colors duration-200 cursor-row-resize',
}

