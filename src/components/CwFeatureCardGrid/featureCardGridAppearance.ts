import type { CwFeatureCardGridAppearance, CwFeatureCardGridStyles } from './types'
import { featureCardGridBase } from './styles'

const homeAppearance: Partial<CwFeatureCardGridStyles> = {
  item:
    'flex flex-col items-center justify-start cursor-default select-none rounded-xl px-3 py-4 transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)] min-h-[7.5rem]',
  label: 'mt-2 text-sm font-medium text-[var(--text-color-primary)] text-center w-full',
  description:
    'mt-1 text-xs leading-relaxed text-[var(--text-color-secondary)] text-center w-full whitespace-normal',
  iconBox: 'flex items-center justify-center w-12 h-12 rounded-2xl',
}

export function resolveFeatureCardGridStyles(
  appearance: CwFeatureCardGridAppearance,
): CwFeatureCardGridStyles {
  if (appearance === 'home') {
    return { ...featureCardGridBase, ...homeAppearance }
  }
  return featureCardGridBase
}
