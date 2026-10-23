export const cwWorkbenchAiPanelStyles = {
  root: 'cw-workbench-ai-panel flex h-full min-h-0 flex-col',
  banner:
    'm-0 shrink-0 hairline-border-b border-[var(--border-color)] px-3 py-1.5 text-xs text-[var(--text-color-secondary)]',
  errorBanner:
    'm-0 shrink-0 hairline-border-b border-[var(--border-color)] px-3 py-1.5 text-xs text-[var(--error-color-6)]',
  listWrap: 'flex min-h-0 flex-1 flex-col',
  composerWrap: 'shrink-0 px-2 pb-2 pt-1',
} as const
