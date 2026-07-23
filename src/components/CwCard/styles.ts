import type { CwCardStyles } from './types'

export const defaultStyles: CwCardStyles = {
  root: 'cw-card w-full bg-[var(--bg-color-container)] border border-[var(--border-color-extra-light)] rounded-lg overflow-hidden',
  header: 'flex items-center justify-between px-4 h-[2.625rem] relative',
  headerDivider: 'after:content-[""] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-[var(--bg-color-component)] after:scale-y-[0.5] after:origin-top',
  headerClickable: 'cursor-pointer outline-none focus:outline-none transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)]',
  headerLeft: '',
  headerRight: '',
  body: 'pt-3 px-3 pb-4'
}
