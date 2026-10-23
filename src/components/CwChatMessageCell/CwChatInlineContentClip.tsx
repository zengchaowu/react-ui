import type { KeyboardEvent, MouseEvent } from 'react'
import {
  IM_RICH_FILE_ATTR,
  IM_RICH_FILE_PATH_ATTR,
  IM_RICH_LABEL_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import CwFileIcon from '../CwFileIcon/CwFileIcon'
import CwImageFit from '../CwImageFit/CwImageFit'
import CwTooltip from '../CwTooltip/CwTooltip'
import CwTruncateText from '../CwTruncateText/CwTruncateText'
import {
  READONLY_BUBBLE_FILE_CHIP_INNER_CLASS,
  READONLY_BUBBLE_INLINE_IMAGE_CHIP_CLASS,
  IMAGE_CLIP_BOUNDS_MAX_HEIGHT,
  IMAGE_CLIP_BOUNDS_MIN_HEIGHT,
  IMAGE_CLIP_BOUNDS_MAX_WIDTH,
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
  INLINE_CHIP_LEADING_WRAP_CLASS,
} from './chipStyles'
import {
  basenameFromFilePath,
  FILE_CHIP_CW_FILE_ICON_SIZE,
  FILE_CHIP_PATH_TOOLTIP_SHOW_DELAY,
} from './chatInlineContentClip'

const FILE_CHIP_LABEL_MAX_WIDTH = '11.25rem'

export interface CwChatInlineContentClipProps {
  kind: 'file' | 'image'
  /** 文件路径或图片 URL */
  value: string
  /** 原图像素宽（wire HTML `width`） */
  intrinsicWidth?: number
  /** 原图像素高（wire HTML `height`） */
  intrinsicHeight?: number
  /** 等价 Vue `@preview` */
  onPreview?: (url: string) => void
}

export function CwChatInlineContentClip({
  kind,
  value,
  intrinsicWidth,
  intrinsicHeight,
  onPreview,
}: CwChatInlineContentClipProps) {
  const fileFullPath = value.trim()
  const fileName = basenameFromFilePath(fileFullPath)

  /** wire attrs 与 `.cw-file-ref` 同节点，便于划选 `rangeCoversNodeContents` 判定完整 chip */
  const readonlyFileChipWireAttrs: Record<string, string> = {
    [IM_RICH_FILE_ATTR]: '',
    [IM_RICH_FILE_PATH_ATTR]: fileFullPath,
    [IM_RICH_LABEL_ATTR]: fileName,
  }

  const imageAttachKey = (() => {
    const url = fileFullPath
    if (!url) return ''
    let h = 0
    for (let i = 0; i < url.length; i++) {
      h = (Math.imul(31, h) + url.charCodeAt(i)) | 0
    }
    return `msg_img_${Math.abs(h).toString(36)}`
  })()

  function onImagePreviewClick(e: MouseEvent | KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = fileFullPath
    if (url) onPreview?.(url)
  }

  if (kind === 'image' && fileFullPath) {
    return (
      <span
        className={READONLY_BUBBLE_INLINE_IMAGE_CHIP_CLASS}
        data-cw-inline-image-wrap=""
        data-preview-src={fileFullPath}
        data-image-name={fileName}
        data-natural-width={
          intrinsicWidth && intrinsicWidth > 0 ? intrinsicWidth : undefined
        }
        data-natural-height={
          intrinsicHeight && intrinsicHeight > 0 ? intrinsicHeight : undefined
        }
        data-attach-key={imageAttachKey}
        tabIndex={0}
        role="img"
        aria-label={`预览 ${fileName}`}
        onClick={onImagePreviewClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          onImagePreviewClick(event)
        }}
      >
        <CwImageFit
          src={value}
          alt={fileName}
          readonly
          intrinsicWidth={intrinsicWidth}
          intrinsicHeight={intrinsicHeight}
          boundsMaxWidth={IMAGE_CLIP_BOUNDS_MAX_WIDTH}
          boundsMaxHeight={IMAGE_CLIP_BOUNDS_MAX_HEIGHT}
          boundsMinHeight={IMAGE_CLIP_BOUNDS_MIN_HEIGHT}
          appearance="inline-chip"
        />
      </span>
    )
  }

  if (!fileFullPath) return null

  return (
    <CwTooltip
      content={fileFullPath}
      placement="top"
      showDelay={FILE_CHIP_PATH_TOOLTIP_SHOW_DELAY}
      appearance="inline"
      className={INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS}
      triggerSlot={
        <span
          className={[READONLY_BUBBLE_FILE_CHIP_INNER_CLASS, 'mx-0.5 align-middle']
            .filter(Boolean)
            .join(' ')}
          {...readonlyFileChipWireAttrs}
        >
          <span className={INLINE_CHIP_LEADING_WRAP_CLASS}>
            <CwFileIcon
              path={value}
              isDirectory={false}
              size={FILE_CHIP_CW_FILE_ICON_SIZE}
            />
          </span>
          <CwTruncateText
            text={fileName}
            placement="middle"
            tag="span"
            appearance="chip"
            maxWidth={FILE_CHIP_LABEL_MAX_WIDTH}
            title={fileName.trim() || undefined}
          />
        </span>
      }
    />
  )
}

export default CwChatInlineContentClip
