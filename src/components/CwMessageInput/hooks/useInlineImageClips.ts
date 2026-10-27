import { useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { isRasterImageFile } from '@zengchaowu/shared/functions/file/isRasterImageFile'
import { clampIndex } from '@zengchaowu/shared/functions/number/clampIndex'
import { resolveDroppedFilePath } from '@zengchaowu/ui-shared/components/CwMessageInput/functions/resolveDroppedFilePath'
import { readRasterFileDimensions } from '@zengchaowu/ui-shared/components/CwMessageInput/functions/readRasterFileDimensions'
import { fileToDataUrl } from '@zengchaowu/ui-shared/components/CwMessageInput/functions/fileToDataUrl'
import type {
  CwMessageInputAttachmentPreviewItem,
  CwMessageInputAttachmentPreviewContextMenuEvent,
  CwMessageInputInlineImagePreviewPayload,
} from '../types'

type ImageClipNodePayload = {
  type: 'inlineImage'
  attrs: {
    previewSrc: string
    name: string
    naturalWidth: number
    naturalHeight: number
  }
}

type FileRefNodePayload = {
  type: 'fileRef'
  attrs: { id: string; path: string; label: string }
}

/** 编辑器内联图片（wire format：`img[data-cw-inline-image src=data:|https:]`）与文件引用插入 */
export function useInlineImageClips(options: {
  getEditor: () => Editor | null
  disabled: boolean
  allowComposerAttachmentPipeline: boolean
  droppedFilePathResolver?: (file: File) => string
  onDroppedFiles?: (files: File[]) => void
  onAttachmentPreviewContextMenu?: (
    payload: CwMessageInputAttachmentPreviewContextMenuEvent,
  ) => void
  onInlineImagePreview?: (payload: CwMessageInputInlineImagePreviewPayload) => void
  notifyContentChanged: () => void
}) {
  const {
    getEditor,
    disabled,
    allowComposerAttachmentPipeline,
    droppedFilePathResolver,
    onDroppedFiles,
    onAttachmentPreviewContextMenu,
    onInlineImagePreview,
    notifyContentChanged,
  } = options

  const buildImageClipNodes = useCallback(
    async (files: File[]): Promise<ImageClipNodePayload[]> => {
      return Promise.all(
        files.map(async (file) => {
          let naturalWidth = 0
          let naturalHeight = 0
          try {
            const dim = await readRasterFileDimensions(file)
            naturalWidth = dim.width
            naturalHeight = dim.height
          } catch {
            /* CwImageFit onLoad 兜底 */
          }
          const previewSrc = await fileToDataUrl(file)
          return {
            type: 'inlineImage' as const,
            attrs: {
              previewSrc,
              name: file.name || 'image',
              naturalWidth,
              naturalHeight,
            },
          }
        }),
      )
    },
    [],
  )

  const insertImageClipsAt = useCallback(
    async (pos: number, files: File[]): Promise<void> => {
      const ed = getEditor()
      if (!ed || files.length === 0) return
      const nodes = await buildImageClipNodes(files)
      ed.chain().focus().insertContentAt(pos, nodes).run()
      notifyContentChanged()
    },
    [buildImageClipNodes, getEditor, notifyContentChanged],
  )

  const resolvePathForDroppedFile = useCallback(
    (file: File): string => {
      return droppedFilePathResolver?.(file) ?? resolveDroppedFilePath(file)
    },
    [droppedFilePathResolver],
  )

  const buildFileRefNodes = useCallback(
    (files: File[]): FileRefNodePayload[] => {
      const stamp = Date.now()
      return files.map((file, index) => {
        const path = resolvePathForDroppedFile(file)
        const id = `ref_${stamp}_${index}_${Math.random().toString(36).slice(2, 9)}`
        const label = file.name || path.split(/[/\\]/).pop() || path
        return {
          type: 'fileRef' as const,
          attrs: { id, path, label },
        }
      })
    },
    [resolvePathForDroppedFile],
  )

  /** 光栅图 + 其它文件一次插入，避免异步读图期间 file clip 触发 prune 清掉预览 File */
  const insertDroppedFilesAt = useCallback(
    async (pos: number, files: File[]): Promise<void> => {
      const ed = getEditor()
      if (!ed) return
      const raster: File[] = []
      const other: File[] = []
      for (const file of files) {
        if (!file.name.length) continue
        if (isRasterImageFile(file)) raster.push(file)
        else other.push(file)
      }
      if (raster.length === 0 && other.length === 0) return
      const imageItems = raster.length > 0 ? await buildImageClipNodes(raster) : []
      const fileNodes = other.length > 0 ? buildFileRefNodes(other) : []
      ed.chain().focus().insertContentAt(pos, [...imageItems, ...fileNodes]).run()
      notifyContentChanged()
    },
    [buildFileRefNodes, buildImageClipNodes, getEditor, notifyContentChanged],
  )

  const editorHasInlineImageClips = useCallback((): boolean => {
    const ed = getEditor()
    if (!ed) return false
    let found = false
    ed.state.doc.descendants((node) => {
      if (node.type.name === 'inlineImage') found = true
    })
    return found
  }, [getEditor])

  const buildInlineAttachmentPreviewItems = useCallback((): {
    items: CwMessageInputAttachmentPreviewItem[]
    srcOrder: string[]
  } => {
    const ed = getEditor()
    const items: CwMessageInputAttachmentPreviewItem[] = []
    const srcOrder: string[] = []
    if (!ed) return { items, srcOrder }
    ed.state.doc.descendants((node) => {
      if (node.type.name !== 'inlineImage') return
      const src = String(node.attrs.previewSrc ?? '').trim()
      if (!src || srcOrder.includes(src)) return
      const name = String(node.attrs.name ?? '').trim() || 'image'
      srcOrder.push(src)
      items.push({
        key: src,
        file: new File([], name),
        kind: 'image',
        objectUrl: src,
      })
    })
    return { items, srcOrder }
  }, [getEditor])

  const openInlineImageClipPreview = useCallback(
    (previewSrc: string): void => {
      if (disabled) return
      const { items, srcOrder } = buildInlineAttachmentPreviewItems()
      if (items.length === 0) return
      const idx = srcOrder.indexOf(previewSrc.trim())
      onInlineImagePreview?.({
        items,
        startPosition: clampIndex(idx >= 0 ? idx : 0, items.length),
        ...(onAttachmentPreviewContextMenu
          ? { onContextMenu: onAttachmentPreviewContextMenu }
          : {}),
      })
    },
    [
      buildInlineAttachmentPreviewItems,
      disabled,
      onAttachmentPreviewContextMenu,
      onInlineImagePreview,
    ],
  )

  const dispatchDroppedFiles = useCallback(
    (files: File[]): void => {
      const list = Array.from(files).filter((file) => file.name.length > 0)
      if (list.length === 0) return
      onDroppedFiles?.(list)
    },
    [onDroppedFiles],
  )

  /** 插入内联 clip（IM 拖入默认路径；工具栏等也可调用） */
  const ingestDroppedFiles = useCallback(
    (files: File[]): void => {
      if (disabled || !allowComposerAttachmentPipeline) return
      const list = Array.from(files).filter((file) => file.name.length > 0)
      if (list.length === 0) return
      const ed = getEditor()
      if (!ed) return
      if (!ed.view.hasFocus()) {
        ed.chain().focus('end').run()
      } else {
        ed.chain().focus().run()
      }
      const pos = ed.state.selection.anchor
      void insertDroppedFilesAt(pos, list)
    },
    [
      allowComposerAttachmentPipeline,
      disabled,
      getEditor,
      insertDroppedFilesAt,
    ],
  )

  // ---- 文件引用插入（供外部调用） ----
  const insertFileRef = useCallback(
    (path: string, label?: string, lines?: string): void => {
      const ed = getEditor()
      if (!ed) return
      const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const display = label || path.split('/').pop() || path
      ed.chain()
        .focus()
        .insertContent({
          type: 'fileRef',
          attrs: {
            id,
            path,
            label: display,
            ...(lines ? { lines } : {}),
          },
        })
        .run()
      notifyContentChanged()
    },
    [getEditor, notifyContentChanged],
  )

  return {
    insertImageClipsAt,
    insertDroppedFilesAt,
    editorHasInlineImageClips,
    openInlineImageClipPreview,
    dispatchDroppedFiles,
    ingestDroppedFiles,
    insertFileRef,
  }
}
