import { useCallback, useRef, useState } from 'react'
import { hasExternalFileDrag } from '@zengchaowu/shared/functions/dom/fileDrag'

export interface CwExternalFileDropPoint {
  clientX: number
  clientY: number
}

interface FileDropDragEventLike {
  dataTransfer: DataTransfer | null
  clientX: number
  clientY: number
  preventDefault: () => void
}

/**
 * Track OS / external file drag-and-drop (depth-counted dragover).
 * Not for in-app custom drag payloads.
 */
export function useCwExternalFileDrop(
  onDropFiles: (files: File[], point: CwExternalFileDropPoint) => void,
) {
  const [dragOverDepth, setDragOverDepth] = useState(0)
  const onDropFilesRef = useRef(onDropFiles)
  onDropFilesRef.current = onDropFiles

  const onDragEnter = useCallback((event: FileDropDragEventLike) => {
    if (!hasExternalFileDrag(event.dataTransfer)) return
    event.preventDefault()
    setDragOverDepth((depth) => depth + 1)
  }, [])

  const onDragOver = useCallback((event: FileDropDragEventLike) => {
    if (!hasExternalFileDrag(event.dataTransfer)) return
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const onDragLeave = useCallback((event: FileDropDragEventLike) => {
    if (!hasExternalFileDrag(event.dataTransfer)) return
    event.preventDefault()
    setDragOverDepth((depth) => Math.max(0, depth - 1))
  }, [])

  const onDrop = useCallback((event: FileDropDragEventLike) => {
    if (!hasExternalFileDrag(event.dataTransfer)) return
    event.preventDefault()
    setDragOverDepth(0)
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.size >= 0)
    if (!files.length) return
    onDropFilesRef.current(files, { clientX: event.clientX, clientY: event.clientY })
  }, [])

  return {
    isDragOver: dragOverDepth > 0,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
