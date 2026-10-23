import type { CwChatMessageImageProps } from './messageParts.types'
import {
  CHAT_MEDIA_BUBBLE_MAX_PX,
  computeImageOrVideoBubbleSizeStyle,
} from './chatMessageBubbleLayout'
import {
  chatOwnMediaBubbleRingClasses,
  chatPeerBubbleBodyClasses,
} from './chatMessageBubbleSurface'
import {
  chatMessageMetaTextClass,
  chatMessageSecondaryTextClass,
} from './chatMessageTypography'

function numericPercent(value: number | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, value))
}

export function CwChatMessageImage({
  chatMessageId,
  isUploading = false,
  uploadFailed = false,
  uploadProgress,
  uploadPhase,
  thumbnailUrl,
  width,
  height,
  showOnRight,
  maxWidth,
  maxHeight,
  isDownloading = false,
  downloadProgress,
  onClick,
}: CwChatMessageImageProps) {
  const numericUploadPercent = numericPercent(uploadProgress)
  const numericDownloadPercent = numericPercent(downloadProgress)
  const showDownloadProgress =
    isDownloading && !isUploading && !uploadFailed

  /** 缩略图可放在 thumbnailUrl；与 content 同源时仍传同一地址即可 */
  const displaySrc = thumbnailUrl?.trim() ?? ''

  const uploadOverlayText = (() => {
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

  const idlePlaceholderText = isUploading ? uploadOverlayText : '暂无预览'

  function onShellClick() {
    if (!displaySrc) return
    onClick?.()
  }

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
          'cursor-pointer rounded-md overflow-hidden relative bg-[var(--chat-message-bubble-peer-bg)]',
          showOnRight ? chatOwnMediaBubbleRingClasses : chatPeerBubbleBodyClasses,
        ]
          .filter(Boolean)
          .join(' ')}
        style={bubbleSizeStyle}
        onClick={onShellClick}
      >
        {displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt=""
              className="block w-full h-full object-cover select-none pointer-events-none"
              draggable="false"
            />
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
            {isUploading ? (
              <div
                className="absolute inset-0 flex flex-col justify-end bg-[var(--overlay-scrim-heavy)] pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className={[
                    'px-3 pb-3 pt-6 text-center text-[var(--text-color-anti)]',
                    chatMessageMetaTextClass,
                  ].join(' ')}
                >
                  {uploadOverlayText}
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
        ) : (
          <div
            className={[
              'relative flex h-full w-full flex-col items-center justify-center bg-[var(--chat-message-bubble-media-muted-bg)] px-3 text-[var(--text-color-secondary)]',
              chatMessageSecondaryTextClass,
            ].join(' ')}
          >
            <span className="text-center">{idlePlaceholderText}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CwChatMessageImage
