import type { CwPptEditorStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const uiFont = '[font-family:var(--cw-excel-font-ui)]'

const actionButton = `cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xs text-[var(--cw-excel-text-muted)] hover:bg-[var(--cw-excel-bg-cell)] hover:text-[var(--cw-excel-text)] disabled:cursor-not-allowed disabled:opacity-40 ${uiFont} ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

export const pptEditorBase: CwPptEditorStyles = {
  root: `cw-ppt-editor flex h-full min-h-[20rem] min-w-0 w-full flex-col overflow-hidden border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] outline-none ${uiFont}`,
  toolbar: 'flex min-h-10 shrink-0 items-center gap-2 border-b border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-2 py-1',
  pageLabel: 'shrink-0 text-xs tabular-nums text-[var(--cw-excel-text)]',
  actions: 'ml-auto flex shrink-0 items-center gap-1',
  action: actionButton,
  // 滚动交给 CwDiv 的 viewport（自定义滚动条），这里只保留定位与底色
  stage: 'relative min-h-0 flex-1 bg-[var(--cw-excel-bg-header)]',
  stack: 'relative mx-auto my-4',
  slide:
    'absolute left-0 right-0 overflow-visible bg-[var(--cw-excel-bg-cell)] shadow-[0_1px_4px_rgba(0,0,0,0.12)] [isolation:isolate]',
  slideSelected: 'shadow-[inset_0_0_0_2px_var(--cw-excel-selection),0_1px_4px_rgba(0,0,0,0.12)]',
  box: 'absolute box-border overflow-hidden',
  boxSelected: 'shadow-[inset_0_0_0_1px_var(--cw-excel-selection)]',
  boxInput:
    'box-border h-full w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none [font-synthesis:weight] [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased] [text-size-adjust:100%]',
  boxParagraph:
    'm-0 w-full [font-synthesis:weight] [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased] [text-size-adjust:100%]',
  image: 'absolute object-contain',
  imageCrop: 'absolute object-fill',
  imageCover: 'absolute object-cover',
  line: 'pointer-events-none absolute overflow-visible',
  loading: 'absolute inset-0 z-[var(--z-index-sticky)] flex items-center justify-center gap-2 bg-[var(--cw-excel-bg-cell)]',
  loadingText: 'text-sm text-[var(--cw-excel-text-muted)]',
  statusError: 'min-w-0 truncate text-xs text-[var(--error-color-6)]',
}
