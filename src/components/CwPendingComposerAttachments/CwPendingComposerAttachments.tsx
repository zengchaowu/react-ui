import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { isRasterImageFile } from '@zengchaowu/shared/functions/file/isRasterImageFile'
import { isVideoFile } from '@zengchaowu/shared/functions/file/inferMediaType'
import { formatFileSize } from '@zengchaowu/shared/functions/file/formatFileSize'
import { clampIndex } from '@zengchaowu/shared/functions/number/clampIndex'
import { CW_FILE_ICON_SIZE_COMPOSER_PENDING } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'
import CwCornerClosableWrap from '../CwCornerClosableWrap/CwCornerClosableWrap'
import CwFileIcon from '../CwFileIcon/CwFileIcon'
import { pendingComposerAttachmentStyles as styles } from './styles'
import type {
  CwPendingAttachmentPreviewItem,
  CwPendingComposerAttachmentKind,
  CwPendingComposerAttachmentsHandle,
  CwPendingComposerAttachmentsProps,
} from './types'

function inferDroppedAttachmentKind(file: File): CwPendingComposerAttachmentKind {
  if (isRasterImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'video'
  return 'file'
}

function droppedAttachmentNeedsObjectUrl(kind: CwPendingComposerAttachmentKind): boolean {
  return kind === 'image' || kind === 'video'
}

function buildPreviewItems(
  files: File[],
  previewUrls: string[],
): CwPendingAttachmentPreviewItem[] {
  return files.map((file, index) => {
    const kind = inferDroppedAttachmentKind(file)
    const item: CwPendingAttachmentPreviewItem = {
      key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      file,
      kind,
      sizeBytes: file.size,
      sourceIndex: index,
    }
    if (!droppedAttachmentNeedsObjectUrl(kind)) return item
    const url = previewUrls[index]?.trim()
    return url ? { ...item, objectUrl: url } : item
  })
}

function formatPendingFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  return formatFileSize(bytes, 1, 'zh')
}

/**
 * 等价 Vue `CwPendingComposerAttachments`。
 * 文件状态由本组件持有；预览打开通过 `onPreviewOpen` 回调交给宿主接入命令式预览 API。
 */
export const CwPendingComposerAttachments = forwardRef<
  CwPendingComposerAttachmentsHandle,
  CwPendingComposerAttachmentsProps
>(function CwPendingComposerAttachments(
  {
    disabled = false,
    density = 'default',
    closeLabel = '移除',
    onChange,
    onAttachmentPreviewContextMenu,
    onPreviewOpen,
    className,
  },
  ref,
) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviewUrls, setPendingPreviewUrls] = useState<string[]>([])

  const filesRef = useRef<File[]>(pendingFiles)
  filesRef.current = pendingFiles

  // pendingFiles 变化后重建对象 URL，并在下次变化/卸载时回收
  useEffect(() => {
    const urls = pendingFiles.map((f) =>
      droppedAttachmentNeedsObjectUrl(inferDroppedAttachmentKind(f))
        ? URL.createObjectURL(f)
        : '',
    )
    setPendingPreviewUrls(urls)
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u)
      })
    }
  }, [pendingFiles])

  // 文件变化回调（等价 Vue deep watch，仅变化时触发，挂载时不触发）
  const lastEmittedRef = useRef<File[]>(pendingFiles)
  useEffect(() => {
    if (lastEmittedRef.current === pendingFiles) return
    lastEmittedRef.current = pendingFiles
    onChange?.([...pendingFiles])
  }, [pendingFiles, onChange])

  function addPendingFiles(files: File[] | FileList) {
    const arr = Array.from(files)
    if (arr.length === 0) return
    setPendingFiles((prev) => [...prev, ...arr])
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function clearPendingFiles() {
    setPendingFiles([])
  }

  function openPendingAttachmentPreview(index: number) {
    if (disabled || pendingFiles.length === 0) return
    if (!onPreviewOpen) return
    onPreviewOpen({
      items: buildPreviewItems(pendingFiles, pendingPreviewUrls),
      startPosition: clampIndex(index, pendingFiles.length),
      onContextMenu: onAttachmentPreviewContextMenu,
    })
  }

  useImperativeHandle(
    ref,
    (): CwPendingComposerAttachmentsHandle => ({
      addFiles: addPendingFiles,
      clear: clearPendingFiles,
      clearPendingFiles,
      get pendingFiles() {
        return filesRef.current
      },
      get pendingCount() {
        return filesRef.current.length
      },
    }),
    [disabled],
  )

  if (pendingFiles.length === 0) return null

  return (
    <div
      className={[
        density === 'compact' ? styles.rootCompact : styles.root,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.inner}>
        {pendingFiles.map((f, idx) => (
          <CwCornerClosableWrap
            key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
            disabled={disabled}
            texts={{ closeLabel }}
            onClose={() => removePendingFile(idx)}
          >
            {isRasterImageFile(f) ? (
              <div
                className={styles.rasterFrame}
                role="button"
                tabIndex={0}
                aria-label={`预览 ${f.name}`}
                onClick={() => openPendingAttachmentPreview(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openPendingAttachmentPreview(idx)
                  }
                }}
              >
                {pendingPreviewUrls[idx] ? (
                  <img
                    src={pendingPreviewUrls[idx]}
                    alt={f.name}
                    className={styles.rasterImg}
                    draggable={false}
                  />
                ) : null}
              </div>
            ) : (
              <div
                className={styles.fileCard}
                role="button"
                tabIndex={0}
                aria-label={`预览 ${f.name}`}
                onClick={() => openPendingAttachmentPreview(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openPendingAttachmentPreview(idx)
                  }
                }}
              >
                <div className={styles.fileCardIconWrap}>
                  <CwFileIcon
                    path={f.name}
                    isDirectory={false}
                    size={CW_FILE_ICON_SIZE_COMPOSER_PENDING}
                    className="shrink-0"
                  />
                </div>
                <div className={styles.fileCardMeta}>
                  <span className={styles.fileCardTitle}>{f.name}</span>
                  <span className={styles.fileCardSize}>
                    {formatPendingFileSize(f.size)}
                  </span>
                </div>
              </div>
            )}
          </CwCornerClosableWrap>
        ))}
      </div>
    </div>
  )
})

export default CwPendingComposerAttachments
