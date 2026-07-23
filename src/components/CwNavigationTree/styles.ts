import type { CwNavigationTreeStyles } from './types'
import type { CwTreeStyles } from '../CwTree/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export const defaultStyles: CwNavigationTreeStyles = {
  root: 'outline-none',
  /** 展开态旋转已改由内联 style 控制（与 CwTree switcher 一致）；保留字段供外部 styles 覆盖兼容 */
  switcherIconExpanded: '',
  treeStyles: {
    root: 'outline-none',
    nodeContent: 'flex items-center gap-2 py-2 pl-3 pr-3 text-sm text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] rounded-md',
    nodeContentSelected: 'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] font-medium',
    nodeIcon: 'flex-shrink-0'
  } as Partial<CwTreeStyles>,
  iconStyles: {
    root: 'text-[var(--text-color-secondary)] flex-shrink-0',
    size: 1
  } as CwIconEmbed,
  switcherIconStyles: {
    root: 'text-[var(--text-color-secondary)] flex-shrink-0 transition-transform duration-200',
    size: 0.75
  } as CwIconEmbed
}
