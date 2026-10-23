import type { CwFormItemAppearance, CwFormItemStyles } from './types'
import { formItemBase } from './styles'

const horizontalFilterPatch: Partial<CwFormItemStyles> = {
  root: 'flex items-start gap-3',
  label: 'text-sm font-medium mb-0 pt-2 text-right',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelReadonly: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  labelText: 'inline-block',
  content: 'flex-1 min-w-0 flex flex-col',
}

const dialogFieldPatch: Partial<CwFormItemStyles> = {
  root: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium mb-0',
  labelNormal: 'text-[var(--text-color-secondary)]',
  labelReadonly: 'text-[var(--text-color-secondary)]',
  content: 'w-full min-w-0',
}

const compactFieldPatch: Partial<CwFormItemStyles> = {
  root: 'cw-form-item flex flex-col gap-1.5',
  label: 'px-0.5 text-xs font-normal mb-0',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelReadonly: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  labelText: 'inline-block',
  content: 'flex-grow min-w-0 flex flex-col',
  component: 'flex min-w-0 w-full flex-1 flex-col',
}

export function resolveFormItemStyles(
  appearance: CwFormItemAppearance = 'default',
): CwFormItemStyles {
  switch (appearance) {
    case 'filter-row':
      return { ...formItemBase, ...horizontalFilterPatch }
    case 'dialog-row':
      return { ...formItemBase, ...dialogFieldPatch }
    case 'field-compact':
      return { ...formItemBase, ...compactFieldPatch }
    default:
      return formItemBase
  }
}
