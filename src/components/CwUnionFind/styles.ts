import type { CwUnionFindStyles } from './types'
import { NATIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const unionFindBase: CwUnionFindStyles = {
  root: 'cw-union-find',
  container: 'relative',
  svg: 'absolute top-0 left-0 pointer-events-none',
  setLabel: 'absolute px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all border -translate-x-1/2 whitespace-nowrap',
  node: 'absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:scale-110',
  nodeActive: 'ring-2 ring-[var(--brand-color-special)] ring-opacity-50',
  nodeRoot: 'ring-2 ring-[var(--success-color-special)] ring-opacity-50',
  controls: 'mt-4 flex flex-wrap gap-2',
  button: 'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
  buttonPrimary: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  buttonSecondary: 'bg-[var(--bg-color-component)] text-[var(--text-color-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-color-secondarycomponent-hover)]',
  buttonDanger: 'bg-[var(--error-color-6)] text-[var(--text-color-anti)] border-[var(--error-color-6)] hover:bg-[var(--error-color-hover)]',
  input: `px-2 py-1 text-sm border border-[var(--border-color)] rounded ${NATIVE_FOCUS_CLASS}`,
  status: 'mt-2 text-sm text-[var(--text-color-secondary)]',
  edge: 'stroke-[var(--text-color-secondary)]'
}
