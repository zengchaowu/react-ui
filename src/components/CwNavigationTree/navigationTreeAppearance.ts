import type { CwIconEmbed } from '../CwIcon/types'
import type { CwTreeStylesOverride } from '../CwTree/cwTreeStylesOverride'
import type { CwNavigationTreeAppearance } from './types'

const adminTreeOverride: CwTreeStylesOverride = {
  root: 'outline-none',
  nodeContent:
    'flex items-center gap-2 py-2 pl-3 pr-3 text-sm leading-none text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] rounded-md',
  nodeContentSelected:
    'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] font-medium',
  nodeLabel: 'min-w-0 flex-1 truncate leading-none self-center',
  nodeIcon:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center self-center',
}

const cloudDiskTreeOverride: CwTreeStylesOverride = {
  root: 'min-w-0 outline-none',
  nodeContent:
    'flex items-center gap-2 rounded-md py-2 pl-2.5 pr-2 text-sm text-[var(--text-color-primary)] transition-colors hover:bg-[var(--bg-color-component-hover)]',
  nodeContentSelected:
    'bg-[var(--bg-color-secondarycontainer)] text-[var(--brand-color-6)] font-medium border-l-[3px] border-l-[var(--brand-color-6)] [&_*]:text-[var(--brand-color-6)]',
  nodeContentHighlighted: '',
  nodeLabel: 'min-w-0 flex-1 truncate leading-none',
  nodeIcon:
    'inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center',
  nodeExtra: 'ml-1 inline-flex shrink-0 items-center justify-center',
}

export function resolveNavigationTreeTreeOverride(
  appearance: CwNavigationTreeAppearance,
): CwTreeStylesOverride {
  return appearance === 'cloudDisk' ? cloudDiskTreeOverride : adminTreeOverride
}

const adminIconEmbed: CwIconEmbed = {
  class:
    'inline-flex shrink-0 items-center justify-center leading-none text-[var(--text-color-secondary)]',
  size: 1,
}

const cloudDiskIconEmbed: CwIconEmbed = {
  class:
    'inline-flex shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
  size: 1.125,
}

export function resolveNavigationTreeIconEmbed(
  appearance: CwNavigationTreeAppearance,
): CwIconEmbed {
  return appearance === 'cloudDisk' ? cloudDiskIconEmbed : adminIconEmbed
}

const adminSwitcherIconEmbed: CwIconEmbed = {
  class:
    'inline-flex items-center justify-center text-[var(--text-color-placeholder)] flex-shrink-0 transition-transform duration-200',
  size: 0.75,
}

const cloudDiskSwitcherIconEmbed: CwIconEmbed = {
  class:
    'inline-flex shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
  size: 0.75,
}

export function resolveNavigationTreeSwitcherIconEmbed(
  appearance: CwNavigationTreeAppearance,
): CwIconEmbed {
  return appearance === 'cloudDisk'
    ? cloudDiskSwitcherIconEmbed
    : adminSwitcherIconEmbed
}
