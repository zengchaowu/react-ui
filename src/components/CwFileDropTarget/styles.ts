import type { CwFileDropTargetStyles } from './types'

/** @internal */
export const fileDropTargetBase: CwFileDropTargetStyles = {
  root: 'relative flex min-h-0 min-w-0 h-full w-full flex-1 flex-col',
  rootDragActive: '!border-[var(--brand-color-6)]',
  content: 'relative flex min-h-0 min-w-0 flex-1 flex-col',
  /** 拖入高亮时隐藏默认文案，避免与 overlay「松开以上传」叠字 */
  contentHiddenWhileDrag: 'invisible',
  /** 边框改由根节点切换颜色，overlay 只负责底色与文案 */
  overlay:
    'pointer-events-none absolute inset-0 z-[var(--z-index-sticky)] flex items-center justify-center bg-transparent opacity-0 transition-opacity duration-150',
  overlayActive:
    'opacity-100 bg-[color-mix(in_srgb,var(--brand-color-6)_8%,transparent)]',
  overlayInner: 'flex flex-col items-center gap-2 px-4 text-center',
  overlayIcon:
    'inline-flex items-center justify-center text-[var(--brand-color-6)] [&_.cw-icon]:text-[var(--brand-color-6)]',
  overlayText: 'text-sm text-[var(--brand-color-6)]',
}
