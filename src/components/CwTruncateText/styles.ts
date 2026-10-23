import type { CwTruncateTextAppearance, CwTruncateTextStyles } from './types'

const FILE_CHIP_LABEL_CLASS =
  'cw-file-ref-label cw-inline-chip-label min-w-0 shrink max-w-[11.25rem]'

export const truncateTextBase: CwTruncateTextStyles = {
  root: 'cw-truncate-text block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  /**
   * keep-end（dir=rtl + 内层 dir=ltr）必须用 inline + unicode-bidi:embed。
   * 勿用 inline-block/max-w-full，否则内层被钳在容器宽，外层看不到溢出，会变成普通末尾省略。
   */
  inner: 'inline [unicode-bidi:embed]',
}

const attachmentLabelTypo =
  'text-center [font-size:var(--font-size-xs)] leading-tight text-[var(--text-color-secondary)]'

export const appearanceStyles: Record<
  CwTruncateTextAppearance,
  Partial<CwTruncateTextStyles>
> = {
  default: {},
  filename: {
    root: `block w-full min-w-0 max-w-full ${attachmentLabelTypo}`,
    inner: attachmentLabelTypo,
  },
  chip: {
    root: [
      FILE_CHIP_LABEL_CLASS,
      'relative block min-w-0 flex-1 basis-0 overflow-hidden whitespace-nowrap',
      'text-xs font-medium leading-none text-[var(--brand-color-6)]',
    ].join(' '),
    inner: 'text-xs font-medium leading-none text-[var(--brand-color-6)]',
  },
  'title-line': {
    root: '!block !w-full min-w-0 max-w-full overflow-hidden text-base font-medium text-[var(--text-color-primary)] text-center',
    inner: 'text-base font-medium text-[var(--text-color-primary)]',
  },
}
