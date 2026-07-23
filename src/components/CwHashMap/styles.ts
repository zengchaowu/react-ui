import type { CwHashMapStyles } from './types'
import { NATIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwHashMapStyles = {
  root: 'cw-hash-map',
  container: 'relative',
  svg: 'absolute top-0 left-0 pointer-events-none',
  bucket: 'absolute flex items-center justify-center rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md border-2 border-[var(--component-border)] bg-[var(--bg-color-container)]',
  bucketActive: 'ring-2 ring-[var(--brand-color-6)] ring-opacity-50',
  bucketLabel: 'text-xs text-[var(--text-color-primary)]',
  entry: 'absolute flex items-center justify-center rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md border-2 border-[var(--component-border)] bg-[var(--bg-color-container)]',
  entryActive: 'ring-2 ring-[var(--brand-color-6)] ring-opacity-50',
  entryKey: 'text-xs text-[var(--text-color-primary)]',
  entryValue: 'text-xs text-[var(--text-color-secondary)]',
  controls: 'mt-4 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg shadow-inner space-y-4',
  button: 'px-4 py-2 rounded-md text-sm font-medium transition-colors',
  buttonPrimary: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--brand-color-hover)]',
  buttonSecondary: 'bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)] hover:bg-[var(--bg-color-secondarycomponent-hover)]',
  buttonDanger: 'bg-[var(--error-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--error-color-hover)]',
  input: `block w-full px-3 py-2 border border-[var(--component-border)] rounded-md shadow-sm ${NATIVE_FOCUS_CLASS} sm:text-sm`,
  status: 'mt-4 p-3 bg-[var(--button-brand-tint-hover-bg)] border border-[var(--brand-color-special)] text-[var(--brand-color-active)] rounded-md text-sm',
  line: 'stroke-[var(--text-color-secondary)]'
}
