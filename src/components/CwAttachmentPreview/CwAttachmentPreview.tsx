import { useMemo, useRef } from 'react'
import type { CwAttachmentPreviewProps } from './types'
import type { CwAttachmentPreviewTexts } from '@zengchaowu/ui-shared/components/CwAttachmentPreview/types'
import { attachmentPreviewBase } from '@zengchaowu/ui-shared/components/CwAttachmentPreview/styles'
import { defaultCwAttachmentPreviewTexts } from '@zengchaowu/ui-shared/components/CwAttachmentPreview/texts'
import CwAttachmentGallery from '../CwAttachmentGallery/CwAttachmentGallery'
import CwButton from '../CwButton/CwButton'
import CwDynamicDialogLayer from '../CwDynamicDialog/CwDynamicDialogLayer'
import CwIcon from '../CwIcon/CwIcon'
import { useFullscreenAttachmentPreviewOverlay } from './hooks/useFullscreenAttachmentPreviewOverlay'
import {
  resolveAttachmentGalleryDownloadSource,
  triggerAttachmentGalleryDownload,
} from './functions/attachmentGalleryActions'
import {
  overlayPreviewDownloadButtonClass,
  CW_OVERLAY_ICON_CLOSE_SIZE,
  CW_OVERLAY_ICON_CLOSE_ICON_CLASS,
} from './functions/overlayIconCloseButton'

export interface CwAttachmentPreviewComponentProps extends CwAttachmentPreviewProps {
  className?: string
}

export function CwAttachmentPreview({
  visible = false,
  items = [],
  initialIndex = 0,
  galleryKey,
  showIndex,
  showIndicator = false,
  showDownload = true,
  closeable = true,
  closeOnClickOverlay = true,
  imagePreviewConfig,
  texts: textsProp,
  onClose,
  onVisibleChange,
  onChange,
  onContextMenu,
  className,
}: CwAttachmentPreviewComponentProps) {
  const texts = useMemo<CwAttachmentPreviewTexts>(
    () => ({
      ...defaultCwAttachmentPreviewTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const activeSlideScaleRef = useRef(imagePreviewConfig?.initialScale ?? 1)

  const {
    previewVisible,
    dialogConfig,
    mergedImagePreviewConfig,
    resolvedShowIndex,
    displayIndex,
    currentIndex,
    onGalleryPointerDown,
    onGalleryPointerMove,
    onGalleryShellClick,
    onGalleryContextMenu,
    close,
    onGalleryIndexChange,
  } = useFullscreenAttachmentPreviewOverlay(
    {
      visible,
      items,
      initialIndex,
      showIndex,
      closeable,
      closeOnClickOverlay,
      imagePreviewConfig,
      onContextMenu,
    },
    { onClose, onVisibleChange, onChange },
    { activeSlideScale: activeSlideScaleRef },
  )

  const currentPreviewItem = items[currentIndex] ?? null

  const currentDownloadSource = useMemo(
    () =>
      currentPreviewItem
        ? resolveAttachmentGalleryDownloadSource(currentPreviewItem)
        : null,
    [currentPreviewItem],
  )

  const resolvedShowDownload = showDownload !== false && currentDownloadSource != null

  const downloadButtonClass = overlayPreviewDownloadButtonClass()
  const downloadAriaLabel = texts.downloadLabel ?? '下载'

  function handleDownloadClick() {
    if (!currentPreviewItem || showDownload === false) return
    triggerAttachmentGalleryDownload(currentPreviewItem)
  }

  return (
    <CwDynamicDialogLayer
      visible={previewVisible}
      config={dialogConfig}
      layerId="cw-attachment-preview"
      onClose={close}
      className={className}
    >
      {resolvedShowIndex ? (
        <div className={attachmentPreviewBase.indexLabel} aria-live="polite">
          {displayIndex} / {items.length}
        </div>
      ) : null}
      {resolvedShowDownload ? (
        <CwButton
          shape="circle"
          variant="text"
          appearance="overlay-icon"
          className={downloadButtonClass}
          texts={{ label: downloadAriaLabel }}
          onClick={handleDownloadClick}
        >
          <CwIcon
            name="common--action--download-line"
            prefix="icon"
            size={CW_OVERLAY_ICON_CLOSE_SIZE}
            className={CW_OVERLAY_ICON_CLOSE_ICON_CLASS}
          />
        </CwButton>
      ) : null}
      <div
        className={attachmentPreviewBase.galleryWrap}
        onPointerDown={onGalleryPointerDown}
        onPointerMove={onGalleryPointerMove}
        onClick={onGalleryShellClick}
        onContextMenu={onGalleryContextMenu}
      >
        <CwAttachmentGallery
          key={galleryKey ?? 'cw-attachment-preview'}
          items={items}
          initialIndex={initialIndex}
          showIndicator={showIndicator === true}
          readonly
          className="h-full min-h-0 w-full flex-1"
          imagePreviewConfig={mergedImagePreviewConfig}
          onIndexChange={onGalleryIndexChange}
          onActiveScaleChange={(scale) => {
            activeSlideScaleRef.current = scale
          }}
        />
      </div>
    </CwDynamicDialogLayer>
  )
}

export default CwAttachmentPreview
