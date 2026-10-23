import type { CwGraphStyles } from './types'
import { NATIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const graphBase: CwGraphStyles = {
  root: 'cw-graph inline-block',
  container: 'relative overflow-hidden',
  svg: 'absolute top-0 left-0 pointer-events-none',
  node: 'absolute flex items-center justify-center rounded-lg cursor-pointer transition-all border-2 border-[var(--border-color)] bg-[var(--bg-color-container)]',
  nodeActive: 'ring-2 ring-[var(--brand-color-6)] ring-opacity-50',
  nodeLabel: 'text-xs text-[var(--text-color-primary)]',
  edge: 'stroke-[var(--text-color-secondary)]',
  edgeActive: 'stroke-[var(--brand-color-6)]',
  arrow: 'fill-[var(--text-color-secondary)]',
  controls: 'mt-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg space-y-4',
  button: 'px-4 py-2 rounded-md text-sm font-medium transition-colors',
  buttonPrimary: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--brand-color-hover)]',
  buttonSecondary: 'bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)] hover:bg-[var(--bg-color-secondarycomponent-hover)]',
  buttonDanger: 'bg-[var(--error-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--error-color-hover)]',
  input: `block w-full px-3 py-2 border border-[var(--border-color)] rounded-md text-sm ${NATIVE_FOCUS_CLASS}`,
  status: 'mt-4 p-3 bg-[var(--button-brand-tint-hover-bg)] border border-[var(--brand-color-special)] text-[var(--brand-color-active)] rounded-md text-sm'
}
