import type { CwResizeFrameStyles } from './types'

export const defaultCwResizeFrameStyles: CwResizeFrameStyles = {
  root: 'cw-resize-frame inline-block max-w-full align-top',
  sizeLabel:
    'mb-1.5 block text-end [font-size:var(--font-size-caption)] leading-none tabular-nums text-[var(--text-color-secondary)]',
  chrome:
    'inline-grid grid-cols-[minmax(0,auto)] grid-rows-[minmax(0,auto)] items-stretch justify-items-stretch gap-0 overflow-hidden rounded bg-[var(--bg-color-component)] p-0 shadow-[var(--shadow-1)]',
  chromeResizeWidth: 'grid-cols-[minmax(0,auto)_14px]',
  chromeResizeHeight: 'grid-rows-[minmax(0,auto)_14px]',
  frameBody:
    'col-start-1 row-start-1 min-h-0 min-w-0 box-border overflow-hidden border border-[var(--component-border)] bg-[var(--bg-color-container)]',
  content: 'box-border h-full w-full overflow-hidden',
  handleBase:
    'flex touch-none select-none items-center justify-center bg-[var(--bg-color-secondarycomponent)] transition-colors hover:bg-[var(--bg-color-secondarycomponent-hover)] active:bg-[var(--bg-color-secondarycomponent-hover)] [&:hover_span]:opacity-100 [&:hover_span]:brightness-75',
  handleEast: 'col-start-2 row-start-1 h-full min-h-full w-3.5 cursor-ew-resize',
  handleSouth: 'col-start-1 row-start-2 min-w-full w-full h-3.5 cursor-ns-resize',
  handleSouthEast: 'col-start-2 row-start-2 h-3.5 w-3.5 cursor-nwse-resize',
  gripVertical:
    'block h-[1.375rem] w-1 shrink-0 bg-[repeating-linear-gradient(90deg,var(--text-color-placeholder)_0_1px,transparent_1px_3px)] opacity-80',
  gripHorizontal:
    'block h-1 w-[1.375rem] shrink-0 bg-[repeating-linear-gradient(180deg,var(--text-color-placeholder)_0_1px,transparent_1px_3px)] opacity-80',
  gripCorner:
    'block h-2 w-2 shrink-0 rotate-45 border-b border-r border-[var(--text-color-placeholder)] opacity-80',
}
