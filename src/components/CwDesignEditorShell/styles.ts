import type { CwDesignEditorShellStyles } from './types'

export const designEditorShellBase: CwDesignEditorShellStyles = {
  root:
    'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--bg-color-page)]',
  header:
    'flex shrink-0 items-center hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]',
  toolRail: 'shrink-0',
  body: 'flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden',
  leftPanel:
    'flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--bg-color-container)]',
  canvas: 'relative min-h-0 min-w-0 h-full flex-1 overflow-hidden',
  inspector:
    'flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--bg-color-container)]',
  assistant:
    'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--bg-color-container)]',
}
