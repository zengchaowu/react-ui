import type { CwCardAppearance, CwCardStyles } from './types'
import { CARD_HEADER_CLASS, cardBase } from './styles'

const formCardShell: CwCardStyles = {
  ...cardBase,
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg overflow-hidden',
  header: `${CARD_HEADER_CLASS} hairline-border-b border-[var(--border-color)]`,
  headerDivider: '',
  body: '',
}

const featureGridShell: CwCardStyles = {
  ...cardBase,
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg overflow-hidden',
  header: `${CARD_HEADER_CLASS} bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-color-6)_5%,transparent)_0%,transparent_100%),linear-gradient(90deg,var(--text-color-anti)_0%,var(--text-color-anti)_100%)]`,
  headerDivider: '',
  body: 'px-3 pt-2 pb-2',
}

const homeSectionShell: CwCardStyles = {
  ...cardBase,
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-xl overflow-hidden',
  header: `${CARD_HEADER_CLASS} bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-color-6)_6%,transparent)_0%,transparent_100%)]`,
  headerDivider: '',
  body: 'px-4 pb-4',
}

const configShell: CwCardStyles = {
  ...cardBase,
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg overflow-hidden',
  header: CARD_HEADER_CLASS,
  headerDivider: '',
  body: 'px-4 py-3',
}

export function resolveCardStyles(appearance: CwCardAppearance): CwCardStyles {
  switch (appearance) {
    case 'form':
      return formCardShell
    case 'grid-cards':
      return featureGridShell
    case 'section':
      return homeSectionShell
    case 'config':
      return configShell
    default:
      return cardBase
  }
}
