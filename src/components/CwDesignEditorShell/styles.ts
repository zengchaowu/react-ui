import type { CwDesignEditorShellStyles } from './types'

export const defaultCwDesignEditorShellStyles: CwDesignEditorShellStyles = {
  root:
    'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--bg-color-page)]',
  header:
    'flex shrink-0 items-center border-b border-[var(--component-border)] bg-[var(--bg-color-container)]',
  toolRail: 'shrink-0',
  body: 'flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden',
  leftPanel:
    'flex h-full min-h-0 shrink-0 flex-col bg-[var(--bg-color-container)]',
  canvas: 'relative min-h-0 min-w-0 flex-1 overflow-hidden',
  inspector:
    'flex h-full min-h-0 shrink-0 flex-col bg-[var(--bg-color-container)]',
  assistant:
    'flex h-full min-h-0 w-[20rem] shrink-0 flex-col overflow-hidden border-l border-[var(--component-border)] bg-[var(--bg-color-container)]',
}
