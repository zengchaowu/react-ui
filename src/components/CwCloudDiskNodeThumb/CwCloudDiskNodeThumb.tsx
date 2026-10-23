import { useEffect, useState } from 'react'
import { CwFileIcon } from '../CwFileIcon'
import { CwIcon } from '../CwIcon'
import { CLOUD_DISK_FOLDER_ICON } from '@zengchaowu/shared/functions/cloudDisk/cloudDiskIconConstants'
import {
  cloudDiskNodeIsFolder,
  cloudDiskNodeIsPreviewableImage,
  cloudDiskNodePreviewImageUrl,
} from '@zengchaowu/shared/functions/cloudDisk/cloudDiskNodeUi'
import type { CwCloudDiskNodeThumbProps } from './types'

export function CwCloudDiskNodeThumb({
  node,
  resolvePreviewUrl,
  fileIconSize = 1,
  folderIconSize = 1,
  iconClass = '',
  previewClass = '',
  folderIcon = CLOUD_DISK_FOLDER_ICON,
  className,
  ...rest
}: CwCloudDiskNodeThumbProps) {
  const [fetchedPreviewUrl, setFetchedPreviewUrl] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)

  const isFolder = cloudDiskNodeIsFolder(node.kind)
  const isPreviewableImage = cloudDiskNodeIsPreviewableImage(node)
  const inlinePreviewUrl = cloudDiskNodePreviewImageUrl(node)

  const effectivePreviewUrl = inlinePreviewUrl || fetchedPreviewUrl
  const showImagePreview =
    isPreviewableImage && Boolean(effectivePreviewUrl) && !previewFailed

  useEffect(() => {
    setFetchedPreviewUrl(null)
    setPreviewFailed(false)
    if (isFolder || !isPreviewableImage || inlinePreviewUrl) return

    let cancelled = false

    async function loadPreviewUrl(nodeId: string) {
      try {
        const url = await resolvePreviewUrl(nodeId)
        if (!cancelled && url?.trim()) {
          setFetchedPreviewUrl(url.trim())
        }
      } catch {
        if (!cancelled) setPreviewFailed(true)
      }
    }

    void loadPreviewUrl(node.id)

    return () => {
      cancelled = true
    }
    // 与 Vue 侧 watch(node.id) 一致：仅在节点 id 变化时重置/拉取
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id])

  function onPreviewError() {
    setPreviewFailed(true)
  }

  const mergedIconClass = [iconClass, className].filter(Boolean).join(' ')

  if (isFolder) {
    return (
      <CwIcon
        mode="symbol"
        name={folderIcon}
        size={folderIconSize}
        className={mergedIconClass}
        {...rest}
      />
    )
  }

  if (showImagePreview) {
    return (
      <img
        src={effectivePreviewUrl!}
        alt={node.name}
        loading="lazy"
        decoding="async"
        className={[previewClass || iconClass, className]
          .filter(Boolean)
          .join(' ')}
        draggable="false"
        onError={onPreviewError}
        {...rest}
      />
    )
  }

  return (
    <CwFileIcon
      path={node.name}
      size={fileIconSize}
      className={mergedIconClass}
      {...rest}
    />
  )
}

export default CwCloudDiskNodeThumb
