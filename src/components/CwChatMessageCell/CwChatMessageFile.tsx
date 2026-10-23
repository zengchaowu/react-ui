import { formatFileSize } from '@zengchaowu/shared/functions/file/formatFileSize'
import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import CwIcon from '../CwIcon/CwIcon'
import CwFileIcon from '../CwFileIcon/CwFileIcon'
import CwTruncateText from '../CwTruncateText/CwTruncateText'
import type { CwChatMessageFileProps } from './messageParts.types'
import {
  chatOwnMediaBubbleRingClasses,
  chatPeerBubbleBodyClasses,
} from './chatMessageBubbleSurface'
import {
  chatMessageFileMetaTextClass,
  chatMessageFileNameTextClass,
} from './chatMessageTypography'

function numericPercent(value: number | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, value))
}

export function CwChatMessageFile({
  chatMessageId,
  isUploading = false,
  uploadFailed = false,
  uploadProgress,
  uploadPhase,
  outboundSending = false,
  fileName,
  fileSize,
  fileSizeBytes,
  downloadUrl,
  isDownloading = false,
  downloadProgress,
  localFilePath,
  fileIcon,
  width,
  height,
  showOnRight,
  downloadByUrl,
  revealLocalFile,
  onClick,
}: CwChatMessageFileProps) {
  const rasterFileIconUrl = (() => {
    const u = fileIcon?.trim()
    if (!u) return ''
    if (/^(https?:|data:|blob:|\/\/)/i.test(u)) return u
    return ''
  })()

  const numericUploadPercent = numericPercent(uploadProgress)
  const numericDownloadPercent = numericPercent(downloadProgress)
  const showDownloadProgressBg =
    isDownloading && !isUploading && !uploadFailed

  const fileSizeLabel = (() => {
    if (fileSize?.trim()) return fileSize.trim()
    if (
      typeof fileSizeBytes === 'number' &&
      Number.isFinite(fileSizeBytes) &&
      fileSizeBytes >= 0
    ) {
      return formatFileSize(fileSizeBytes, 1, 'zh')
    }
    return ''
  })()

  const showQueuedSending = (() => {
    if (uploadFailed || isUploading) return false
    if (outboundSending) return true
    return uploadPhase === 'queued'
  })()

  const secondLineText = (() => {
    if (uploadFailed) return '发送失败'
    if (showDownloadProgressBg) {
      const p = numericDownloadPercent
      if (p != null) return `下载中 ${Math.round(p)}%`
      return '下载中…'
    }
    if (showQueuedSending) return '发送中'
    if (isUploading) {
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
    }
    return fileSizeLabel
  })()

  const downloadSource = downloadUrl?.trim() ?? ''
  const localFilePathResolved = localFilePath?.trim() ?? ''

  const canDownloadFromUrl = (() => {
    const u = downloadSource
    if (!u) return false
    return /^https?:\/\//i.test(u) || u.startsWith('blob:')
  })()

  const showPrimaryFileAction = (() => {
    if (isUploading || uploadFailed || showDownloadProgressBg) return false
    if (localFilePathResolved) return typeof revealLocalFile === 'function'
    return canDownloadFromUrl
  })()

  const primaryFileActionIcon = localFilePathResolved
    ? 'common--nav--file-line'
    : 'common--action--download-line'

  const primaryFileActionAriaLabel = localFilePathResolved
    ? '在文件夹中显示'
    : '下载'

  const bubbleSizeStyle = (() => {
    const style: { width?: string; minHeight?: string } = {}
    if (width != null) style.width = designPxToRem(width)
    if (height != null) style.minHeight = designPxToRem(height)
    return Object.keys(style).length ? style : undefined
  })()

  function onPrimaryFileAction() {
    if (isUploading || uploadFailed || showDownloadProgressBg) return
    const id = chatMessageId?.trim()
    const ctx = id ? { chatMessageId: id } : undefined

    const localPath = localFilePathResolved
    if (localPath && revealLocalFile) {
      void revealLocalFile(localPath, ctx)
      return
    }

    const url = downloadSource
    if (!url || !canDownloadFromUrl) return
    const name = fileName?.trim()
    downloadByUrl(url, name || undefined, ctx)
  }

  return (
    <div
      className={[
        'flex min-w-0 w-fit max-w-full',
        showOnRight ? 'ml-auto justify-end' : 'justify-start',
      ].join(' ')}
    >
      <div
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        className={[
          'cursor-default overflow-hidden rounded-md relative bg-[var(--chat-message-bubble-peer-bg)]',
          'box-border w-[var(--size-message-file-width)] max-w-full min-h-0',
          showOnRight ? chatOwnMediaBubbleRingClasses : chatPeerBubbleBodyClasses,
        ]
          .filter(Boolean)
          .join(' ')}
        style={bubbleSizeStyle}
        onClick={() => onClick?.()}
      >
        {showDownloadProgressBg ? (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {numericDownloadPercent != null ? (
              <div
                className="h-full bg-[color-mix(in_srgb,var(--brand-color-6)_14%,transparent)] transition-[width] duration-150 ease-out"
                style={{ width: `${numericDownloadPercent}%` }}
              />
            ) : (
              <div className="absolute left-0 top-0 h-full w-[42%] bg-[color-mix(in_srgb,var(--brand-color-6)_14%,transparent)] animate-[cw-chat-inline-upload-indeterminate-slide_1.05s_ease-in-out_infinite]" />
            )}
          </div>
        ) : null}
        <div
          className={[
            'relative flex items-center gap-2.5 px-3 py-3 w-full min-h-0',
            showOnRight ? 'flex-row-reverse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={[
              'flex w-fit min-w-0 max-w-[70%] shrink flex-col overflow-hidden',
              showOnRight ? 'items-end text-right' : 'items-start text-left',
            ].join(' ')}
          >
            <CwTruncateText
              text={fileName || ''}
              placement="middle"
              tag="span"
              title={(fileName || '').trim() || undefined}
              className={[
                'w-full min-w-0 font-medium text-[var(--text-color-primary)]',
                chatMessageFileNameTextClass,
              ].join(' ')}
            />
            <div
              className={[
                'mt-1 flex w-full min-w-0 items-center gap-2 text-[var(--text-color-disabled)]',
                showOnRight ? 'justify-end' : 'flex-row-reverse justify-start',
              ].join(' ')}
            >
              <span
                className={[
                  chatMessageFileMetaTextClass,
                  'min-w-0 flex-1 text-ellipsis whitespace-nowrap overflow-hidden',
                  showOnRight ? 'text-right' : 'text-left',
                ].join(' ')}
              >
                {secondLineText}
              </span>
              {showPrimaryFileAction ? (
                <div
                  role="button"
                  tabIndex={0}
                  className="inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--brand-color-6)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)] disabled:pointer-events-none disabled:opacity-50"
                  aria-label={primaryFileActionAriaLabel}
                  title={primaryFileActionAriaLabel}
                  onClick={(event) => {
                    event.stopPropagation()
                    onPrimaryFileAction()
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    event.stopPropagation()
                    onPrimaryFileAction()
                  }}
                >
                  <CwIcon
                    name={primaryFileActionIcon}
                    prefix="icon"
                    size={0.875}
                    className="inline-flex items-center justify-center text-current"
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 min-w-0 flex-1 shrink" aria-hidden="true" />
          {rasterFileIconUrl ? (
            <img
              className="flex-none shrink-0 object-contain h-[var(--size-message-file-icon)] w-[var(--size-message-file-icon)]"
              src={rasterFileIconUrl}
              alt=""
            />
          ) : (
            <div
              className="flex flex-none shrink-0 items-center justify-center h-[var(--size-message-file-icon)] w-[var(--size-message-file-icon)]"
              aria-hidden="true"
            >
              <CwFileIcon
                path={fileName || ''}
                isDirectory={false}
                size={2.25}
                className="shrink-0"
              />
            </div>
          )}
          {isUploading ? (
            <div
              className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-[var(--chat-message-bubble-progress-track)]"
              aria-hidden="true"
            >
              <div className="relative h-full w-full">
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
        </div>
      </div>
    </div>
  )
}

export default CwChatMessageFile
