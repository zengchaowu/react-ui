import { CW_OVERLAY_MODAL_Z_CLASS } from '../constants/cwOverlayStack'
import { CW_OVERLAY_ELECTRON_NO_DRAG_CLASS } from '../constants/cwOverlayHeaderTitle'

/** CwImageGalleryPreview / CwAttachmentPreview 共用的全屏 chrome 样式 */
export const CW_FULLSCREEN_GALLERY_PREVIEW_CHROME_STYLES = {
  root: [
    `fixed inset-0 h-[100dvh] w-full ${CW_OVERLAY_MODAL_Z_CLASS} flex flex-col`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  backdrop:
    'absolute inset-0 z-0 cursor-default bg-[var(--overlay-scrim-gallery)] transition-opacity',
  indexLabel:
    'pointer-events-none absolute left-1/2 top-2 z-[var(--z-index-above)] -translate-x-1/2 text-sm tabular-nums text-[var(--text-color-secondary)]',
  galleryWrap:
    'relative z-[1] flex h-0 min-h-0 w-full flex-1 flex-col',
} as const satisfies CwFullscreenGalleryPreviewChromeStyles

export interface CwFullscreenGalleryPreviewChromeStyles {
  root: string
  backdrop: string
  indexLabel: string
  galleryWrap: string
}
