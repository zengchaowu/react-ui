import type { CwRichTextAppearance, CwRichTextStyles } from './types'
import { richTextBase } from './styles'

export function resolveRichTextStyles(
  appearance: CwRichTextAppearance,
): CwRichTextStyles {
  const base: CwRichTextStyles = { ...richTextBase }

  if (appearance === 'toast') {
    return {
      ...base,
      root: 'cw-rich-text block max-w-full min-w-0 leading-snug text-[length:inherit]',
      text: 'text-[length:inherit] leading-snug text-[var(--toast-surface-fg)]',
      linkNormal:
        'text-[var(--brand-color-6)] cursor-pointer hover:text-[var(--brand-color-hover)]',
    }
  }

  if (appearance === 'agreement') {
    return {
      ...base,
      root: 'inline text-sm leading-relaxed',
      link: `${base.link} whitespace-nowrap`,
      linkNormal:
        'text-[var(--brand-color-6)] hover:opacity-90 touch-manipulation cursor-pointer',
    }
  }

  if (appearance === 'configValue') {
    return {
      ...base,
      root: 'inline-block',
      text: 'text-[var(--text-color-primary)]',
      link: 'text-[var(--brand-color-6)] cursor-pointer outline-none focus:outline-none',
      linkNormal: 'text-[var(--brand-color-6)] cursor-pointer',
    }
  }

  return base
}
