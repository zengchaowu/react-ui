import type { CwFeatureCardGridStyles } from './types'
import type { CwIconEmbed } from '../CwIcon/types'

/** @internal */
export const featureCardGridBase: CwFeatureCardGridStyles = {
  title: 'text-sm font-semibold leading-none text-[var(--text-color-primary)]',
  item:
    'flex flex-col items-center justify-center cursor-pointer select-none rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)]',
  itemDisabled: 'opacity-50 cursor-not-allowed',
  iconBox:
    'flex items-center justify-center w-10 h-10 rounded-[0.75rem] bg-[var(--bg-color-secondarycontainer)]',
  label: 'mt-1 text-xs text-[var(--text-color-secondary)] text-center truncate w-full',
  description:
    'mt-0.5 [font-size:var(--font-size-caption)] text-[var(--text-color-secondary)] text-center truncate w-full',
  iconStyles: {
    class: 'leading-none text-[var(--brand-color-6)]',
    size: 1.375,
  } as CwIconEmbed,
}
