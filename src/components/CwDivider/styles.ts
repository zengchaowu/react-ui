import type { CwDividerStyles } from './types'

/**
 * 内容分割线：文档流里两段之间的条。
 * 盒子描边请用 `hairline-border-*`，不要用本组件去描卡片/输入框/壳层。
 */
export const dividerBase: CwDividerStyles = {
  root: 'cw-divider shrink-0',
  rootDisabled: '',
  withContent: 'cw-divider--with-content flex w-full min-w-0 items-center gap-2 py-1',
  withContentDense: 'cw-divider--with-content flex w-full min-w-0 items-center gap-1.5 py-0.5',
  /** 1px 横线（元件即线；`h-0` + border，与 Cell 下划线同技法） */
  horizontal: 'block w-full h-0 border-t border-solid border-[var(--border-color)]',
  vertical:
    'block h-full min-h-[1rem] w-0 self-stretch border-l border-solid border-[var(--border-color)]',
  hairlineHorizontal: 'block w-full h-0 hairline-border-t',
  hairlineVertical: 'block h-full min-h-[1rem] w-0 self-stretch hairline-border-l',
  line: 'min-w-0 h-0',
  lineGrow: 'min-w-0 flex-1',
  lineShort: 'w-8 shrink-0',
  lineHairline: 'hairline-border-t',
  lineThick: 'border-t border-solid border-[var(--border-color)]',
  lineDashed: '[border-top-style:dashed]',
  lineDashedVertical: '[border-left-style:dashed]',
  label:
    'max-w-[70%] shrink-0 truncate [font-size:var(--font-size-caption)] leading-none',
  labelNormal: 'text-[var(--text-color-placeholder)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  labelBold: 'font-medium',
}
