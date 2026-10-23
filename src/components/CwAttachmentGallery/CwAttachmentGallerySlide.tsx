import { useEffect, useMemo, useRef } from 'react'
import type {
  CwAttachmentGalleryImagePreviewConfig,
  CwAttachmentGalleryItem,
  CwAttachmentGalleryTexts,
} from './types'
import { attachmentGalleryBase } from './styles'
import CwFileIcon from '../CwFileIcon/CwFileIcon'
import CwImagePreview from '../CwImagePreview/CwImagePreview'
import CwTruncateText from '../CwTruncateText/CwTruncateText'
import CwVideoPlayer from '../CwVideoPlayer/CwVideoPlayer'
import type { CwVideoPlayerExpose } from '../CwVideoPlayer/types'
import {
  resolveAttachmentDisplayName,
  resolveAttachmentSizeLabel,
} from './functions/resolveAttachmentSlideMeta'

export interface CwAttachmentGallerySlideProps {
  item: CwAttachmentGalleryItem
  active: boolean
  slideIndex: number
  mediaSrc: string
  disabled?: boolean
  readonly?: boolean
  texts: CwAttachmentGalleryTexts
  imagePreviewConfig?: CwAttachmentGalleryImagePreviewConfig
  onScaleChange?: (slideIndex: number, scale: number) => void
}

export function CwAttachmentGallerySlide({
  item,
  active,
  slideIndex,
  mediaSrc,
  disabled,
  readonly,
  texts,
  imagePreviewConfig,
  onScaleChange,
}: CwAttachmentGallerySlideProps) {
  const videoPlayerRef = useRef<CwVideoPlayerExpose | null>(null)

  useEffect(() => {
    if (!active) videoPlayerRef.current?.pause()
  }, [active])

  const displayFileName = useMemo(
    () => resolveAttachmentDisplayName(item, texts.unnamedFile),
    [item, texts.unnamedFile],
  )

  const fileSizeLabel = resolveAttachmentSizeLabel(item)

  return (
    <div
      className={attachmentGalleryBase.slideItem}
      style={{ width: '100%', height: '100%' }}
    >
      {item.kind === 'image' ? (
        <CwImagePreview
          src={mediaSrc}
          alt={displayFileName || texts.imageAlt}
          disabled={disabled}
          readonly={readonly}
          active={active}
          delegatesTouchPanToParent
          {...imagePreviewConfig}
          onUpdateScale={(scale) => onScaleChange?.(slideIndex, scale)}
        />
      ) : item.kind === 'video' ? (
        <div
          className={attachmentGalleryBase.videoSlide}
          onClick={(event) => event.stopPropagation()}
        >
          {/* 始终挂载：勿用 active 卸载，否则拖拽 peek 换页时半屏视频会闪没 */}
          <CwVideoPlayer
            ref={videoPlayerRef}
            src={mediaSrc}
            fitToParent
            controls={false}
            fullscreen={false}
            autoplay={false}
            preload="metadata"
            className="bg-transparent shadow-none [&_.cw-video-player]:bg-transparent [&_video]:object-contain"
          />
        </div>
      ) : (
        <div className={attachmentGalleryBase.fileInfoPanel}>
          <div className={attachmentGalleryBase.fileInfoIconWrap}>
            <CwFileIcon
              path={displayFileName}
              isDirectory={false}
              size={3}
              className="shrink-0"
            />
          </div>
          <div className="w-full min-w-0 max-w-full">
            <CwTruncateText
              text={displayFileName}
              placement="middle"
              tag="div"
              title={displayFileName.trim() || undefined}
              appearance="title-line"
              className="!text-[var(--text-color-anti)]"
            />
          </div>
          {fileSizeLabel ? (
            <p className={attachmentGalleryBase.fileInfoMeta}>{fileSizeLabel}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default CwAttachmentGallerySlide
