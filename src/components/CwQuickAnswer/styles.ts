import type { CwQuickAnswerStyles } from './types'

export const defaultStyles: CwQuickAnswerStyles = {
  root: 'cw-quick-answer w-full bg-[var(--bg-color-container)] rounded-lg p-4',
  label: 'inline-block px-3 py-1 rounded-full bg-[var(--brand-color-6)] text-[var(--text-color-anti)] text-sm font-medium mb-3',
  content: 'space-y-3',
  description: 'text-sm text-[var(--text-color-primary)] leading-relaxed',
  conditions: 'space-y-2',
  conditionItem: 'text-sm text-[var(--text-color-primary)] leading-relaxed',
  buttons: 'flex gap-3 mt-4',
  buttonYes: 'flex-1 px-4 py-2 rounded-lg border border-[var(--brand-color-special)] bg-[var(--bg-color-container)] text-[var(--text-color-primary)] text-sm font-medium transition-colors hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-component)] disabled:opacity-50 disabled:cursor-not-allowed',
  buttonNo: 'flex-1 px-4 py-2 rounded-lg border border-[var(--brand-color-special)] bg-[var(--bg-color-container)] text-[var(--text-color-primary)] text-sm font-medium transition-colors hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-component)] disabled:opacity-50 disabled:cursor-not-allowed',
  buttonYesActive: '!bg-[var(--brand-color-6)] !text-[var(--text-color-anti)] !border-[var(--brand-color-6)] hover:!bg-[var(--brand-color-hover)] active:!bg-[var(--brand-color-active)]',
  buttonNoActive: '!bg-[var(--brand-color-6)] !text-[var(--text-color-anti)] !border-[var(--brand-color-6)] hover:!bg-[var(--brand-color-hover)] active:!bg-[var(--brand-color-active)]'
}
