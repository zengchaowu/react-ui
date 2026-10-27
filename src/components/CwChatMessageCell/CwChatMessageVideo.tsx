import type { CwChatMessageVideoProps } from './messageParts.types'
import CwVideoPlayer from '../CwVideoPlayer/CwVideoPlayer'
import {
  CHAT_MEDIA_BUBBLE_MAX_PX,
  computeImageOrVideoBubbleSizeStyle,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageBubbleLayout'
import { chatOwnMediaBubbleRingClasses } from './chatMessageBubbleSurface'
import {
  chatMessageMetaTextClass,
  chatMessageSecondaryTextClass,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageTypography'

function numericPercent(value: number | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, value))
}

export function CwChatMessageVideo({
  chatMessageId,
  isUploading = false,
  uploadFailed = false,
  uploadProgress,
  uploadPhase,
  thumbnailUrl,
  videoUrl,
  width,
  height,
  showOnRight,
  maxWidth,
  maxHeight,
  isDownloading = false,
  downloadProgress,
  onPlay,
  onClick,
}: CwChatMessageVideoProps) {
  const numericUploadPercent = numericPercent(uploadProgress)
  const numericDownloadPercent = numericPercent(downloadProgress)
  const showDownloadProgress = isDownloading && !isUploading && !uploadFailed

  const uploadLabel = (() => {
    if (uploadPhase === 'registering') return '正在准备上传…'
    if (uploadPhase === 'server_storage') {
      if (typeof uploadProgress === 'number' && Number.isFinite(uploadProgress)) {
        return `本机已传 ${Math.round(uploadProgress)}% · 正在写入对象存储…`
      }
      return '正在写入对象存储…'
    }
    if (typeof uploadProgress === 'number' && Number.isFinite(uploadProgress)) {
      return `上传中 ${Math.round(uploadProgress)}%`
    }
    return '上传中…'
  })()

  const posterForUpload = (() => {
    const thumb = thumbnailUrl?.trim()
    if (thumb) return thumb
    if (uploadFailed) return videoUrl?.trim() ?? ''
    return ''
  })()

  const resolvedVideoUrl = videoUrl?.trim() ?? ''
  const thumbnailPoster = thumbnailUrl?.trim() || undefined
  const showVideoPlayer =
    Boolean(resolvedVideoUrl) && !isUploading && !uploadFailed

  const bubbleSizeStyle = computeImageOrVideoBubbleSizeStyle(width, height, {
    maxWidth: maxWidth ?? CHAT_MEDIA_BUBBLE_MAX_PX,
    maxHeight: maxHeight ?? CHAT_MEDIA_BUBBLE_MAX_PX,
  })

  return (
    <div
      className={[
        'flex min-w-0',
        showOnRight ? 'w-full justify-end' : 'w-full justify-start',
      ].join(' ')}
    >
      <div
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        className={[
          'group relative overflow-hidden rounded-md bg-[var(--overlay-scrim-faint)]',
          showOnRight
            ? chatOwnMediaBubbleRingClasses
            : 'border border-[var(--chat-message-bubble-peer-border)] shadow-none',
        ]
          .filter(Boolean)
          .join(' ')}
        style={bubbleSizeStyle}
      >
        {showVideoPlayer ? (
          <CwVideoPlayer
            fitToParent
            src={resolvedVideoUrl}
            poster={thumbnailPoster}
            onPlay={() => onPlay?.()}
            onClick={() => onClick?.()}
          />
        ) : posterForUpload ? (
          <>
            <img
              src={posterForUpload}
              className="block h-full w-full object-cover select-none"
              alt="Video thumbnail"
              draggable="false"
            />
            {isUploading ? (
              <div
                className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-[var(--overlay-scrim-heavy)]"
                aria-hidden="true"
              >
                <div
                  className={[
                    'px-3 pb-3 pt-6 text-center text-[var(--text-color-anti)]',
                    chatMessageMetaTextClass,
                  ].join(' ')}
                >
                  {uploadLabel}
                </div>
                <div className="relative h-[0.1875rem] w-full overflow-hidden bg-[color-mix(in_srgb,var(--text-color-anti)_25%,transparent)]">
                  {numericUploadPercent != null ? (
                    <div
                      className="h-full bg-[var(--brand-color-6)] transition-[width] duration-150 ease-out"
                      style={{ width: `${numericUploadPercent}%` }}
                    />
                  ) : (
                    <div className="absolute left-0 top-0 h-full w-[36%] bg-[var(--brand-color-6)] animate-[cw-chat-inline-upload-indeterminate-slide_1.05s_ease-in-out_infinite]" />
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : isUploading ? (
          <div
            className={[
              'flex h-full w-full flex-col items-center justify-center bg-[var(--overlay-scrim-subtle)] px-3 text-[var(--text-color-secondary)]',
              chatMessageSecondaryTextClass,
            ].join(' ')}
          >
            <span>{uploadLabel}</span>
            <div
              className="relative mt-3 h-1 w-[70%] max-w-[12.5rem] overflow-hidden rounded-full bg-[var(--overlay-scrim-medium)]"
              aria-hidden="true"
            >
              {numericUploadPercent != null ? (
                <div
                  className="h-full rounded-full bg-[var(--brand-color-6)] transition-[width] duration-150 ease-out"
                  style={{ width: `${numericUploadPercent}%` }}
                />
              ) : (
                <div className="absolute left-0 top-0 h-full w-[36%] rounded-full bg-[var(--brand-color-6)] animate-[cw-chat-inline-upload-indeterminate-slide_1.05s_ease-in-out_infinite]" />
              )}
            </div>
          </div>
        ) : (
          <div
            className={[
              'flex h-full w-full items-center justify-center bg-[var(--overlay-scrim-subtle)] px-3 text-[var(--text-color-secondary)]',
              chatMessageSecondaryTextClass,
            ].join(' ')}
          >
            暂无预览
          </div>
        )}
        {showDownloadProgress ? (
          <div
            className="pointer-events-none absolute inset-0 z-[var(--z-index-above)] overflow-hidden"
            aria-hidden="true"
          >
            {numericDownloadPercent != null ? (
              <div
                className="absolute inset-x-0 bottom-0 bg-[color-mix(in_srgb,var(--brand-color-6)_24%,transparent)] transition-[height] duration-150 ease-out"
                style={{ height: `${numericDownloadPercent}%` }}
              />
            ) : (
              <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[color-mix(in_srgb,var(--brand-color-6)_24%,transparent)] animate-[cw-chat-attachment-download-indeterminate-rise_1.05s_ease-in-out_infinite]" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CwChatMessageVideo
