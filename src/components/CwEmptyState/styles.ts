import type { CwEmptyStateAppearance, CwEmptyStateStyles } from './types'

const sizeMap = {
  small: {
    icon: 'w-10 h-10 mb-3',
    text: 'text-sm',
  },
  medium: {
    icon: 'w-20 h-20 mb-3',
    text: 'text-sm',
  },
  large: {
    icon: 'w-[7.5rem] h-[7.5rem] mb-4',
    text: 'text-base',
  },
}

export function getStyles(size: 'small' | 'medium' | 'large'): CwEmptyStateStyles {
  const sizeStyles = sizeMap[size]

  return {
    root: 'cw-empty-state flex flex-col items-center justify-center py-12 px-4 text-center',
    icon: `${sizeStyles.icon} text-[var(--text-color-placeholder)]`,
    text: `${sizeStyles.text} text-[var(--text-color-placeholder)]`,
    action: 'mt-2',
  }
}

export const appearanceRootClass: Record<CwEmptyStateAppearance, string> = {
  default: '',
  panel:
    'min-h-[13.75rem] gap-3 py-8 [font-size:var(--font-size-body)] text-[var(--text-color-secondary)]',
  compact: 'py-0',
}
