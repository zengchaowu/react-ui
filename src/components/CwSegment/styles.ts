import type { CwSegmentStyles, CwSegmentAppearance } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const segmentBase: CwSegmentStyles = {
  root: 'cw-segment relative inline-flex shrink-0 gap-0.5 rounded-lg bg-[var(--bg-color-component)] p-0.5',
  rootDisabled: 'pointer-events-none opacity-60',
  slider:
    'absolute left-0 top-0 rounded-md bg-[var(--bg-color-container)]',
  sliderMove: 'transition-[transform,width,height] duration-200 ease-out',
  item:
    `relative inline-flex flex-1 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md text-center font-normal outline-none transition-colors duration-200 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  itemActive: 'text-[var(--text-color-primary)]',
  itemInactive: 'text-[var(--text-color-placeholder)] hover:text-[var(--text-color-secondary)]',
}

export const segmentDenseAppearance: Partial<CwSegmentStyles> = {
  root: 'cw-segment relative inline-flex max-w-full shrink-0 gap-0.5 rounded-md bg-gray-100 p-0.5 text-xs leading-none',
  slider: 'absolute left-0 top-0 rounded bg-white shadow-none',
  sliderMove: 'transition-[transform,width,height] duration-150 ease-out',
  item: 'relative inline-flex flex-1 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded !py-1 text-xs font-normal leading-tight text-center outline-none transition-colors duration-200',
  itemActive: 'text-gray-900',
  itemInactive: 'text-gray-500 hover:text-gray-700',
}

export function resolveSegmentStyles(
  appearance: CwSegmentAppearance = 'default',
): CwSegmentStyles {
  if (appearance === 'dense') {
    return { ...segmentBase, ...segmentDenseAppearance }
  }
  return segmentBase
}
