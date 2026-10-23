import type { CwAttachmentGalleryStyles } from './types'

export const attachmentGalleryBase: CwAttachmentGalleryStyles = {
  root: 'cw-attachment-gallery relative h-full w-full overflow-hidden',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  container: 'relative h-full w-full overflow-hidden',
  scrollContainer: 'h-full w-full',
  slideItem: 'h-full w-full',
  videoSlide:
    'relative h-full w-full min-h-0 overflow-hidden [&_.cw-video-player]:absolute [&_.cw-video-player]:inset-0 [&_.cw-video-player]:h-full [&_.cw-video-player]:w-full',
  videoInactive:
    'flex h-full w-full min-w-0 max-w-full flex-col items-stretch justify-center gap-2 px-6 text-[var(--text-color-secondary)]',
  fileInfoPanel:
    'flex h-full w-full min-w-0 max-w-full flex-col items-stretch justify-center gap-4 px-6 text-center text-[var(--text-color-anti)]',
  fileInfoIconWrap:
    'mx-auto flex shrink-0 items-center justify-center',
  fileInfoMeta: 'max-w-full text-sm text-[color-mix(in_srgb,var(--text-color-anti)_72%,transparent)]',
  indicator:
    'pointer-events-none absolute bottom-4 left-1/2 flex w-full max-w-full -translate-x-1/2 justify-center px-4',
}
