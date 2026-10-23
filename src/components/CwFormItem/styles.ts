import type { CwFormItemStyles } from './types'

/** @internal */
export const formItemBase: CwFormItemStyles = {
  root: 'cw-form-item flex flex-col',
  rootNormal: '',
  rootReadonly: '',
  rootDisabled: '',
  label: 'text-sm font-medium mb-2',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelReadonly: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  labelText: 'inline-block',
  labelTipTrigger:
    'inline-flex shrink-0 items-center justify-center rounded-full p-0.5 align-middle text-[var(--text-color-placeholder)] transition-colors hover:text-[var(--text-color-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-color-focus)] focus-visible:ring-offset-1',
  /** 必填星号：与文案 / tip 同排流式排布，避免 absolute 与 tip 重叠 */
  labelRequired: 'inline-block shrink-0 leading-none select-none',
  labelRequiredNormal: 'text-[var(--error-color-6)]',
  labelRequiredReadonly: 'text-[var(--error-color-6)]',
  labelRequiredDisabled: 'text-[var(--text-color-disabled)]',
  content: 'flex-grow min-w-0 flex flex-col',
  component: 'flex min-w-0 w-full flex-1 flex-col',
  error: 'text-[var(--error-color-6)] text-xs mt-1',
}
