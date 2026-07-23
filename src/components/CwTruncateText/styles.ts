import type { CwTruncateTextAppearance, CwTruncateTextStyles } from './types'
import { FILE_CHIP_LABEL_CLASS } from '../CwMessageInput/chips/chipStyles'

export const truncateTextBase: CwTruncateTextStyles = {
  root: 'cw-truncate-text block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  inner: 'inline-block min-w-0 max-w-full',
}

/** @deprecated 使用 truncateTextBase */
export const defaultStyles = truncateTextBase

const attachmentLabelTypo =
  'text-center [font-size:var(--font-size-xs)] leading-tight text-[var(--text-color-secondary)]'

export const appearanceStyles: Record<
  CwTruncateTextAppearance,
  Partial<CwTruncateTextStyles>
> = {
  default: {},
  filenameLabel: {
    root: `block w-full min-w-0 max-w-full ${attachmentLabelTypo}`,
    inner: attachmentLabelTypo,
  },
  chipLabel: {
    root: [
      FILE_CHIP_LABEL_CLASS,
      'relative block min-w-0 flex-1 basis-0 overflow-hidden whitespace-nowrap',
      'text-xs font-medium leading-none text-[var(--text-color-brand)]',
    ].join(' '),
    inner: 'text-xs font-medium leading-none text-[var(--text-color-brand)]',
  },
  fileInfoTitle: {
    root: '!block !w-full min-w-0 max-w-full overflow-hidden text-base font-medium text-[var(--text-color-primary)] text-center',
    inner: 'text-base font-medium text-[var(--text-color-primary)]',
  },
}
