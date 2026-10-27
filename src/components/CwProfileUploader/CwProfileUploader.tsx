import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getFileExtension } from '@zengchaowu/shared/functions/file/getFileExtension'
import CwFileUpload from '../CwFileUpload/CwFileUpload'
import type { UploadFile } from '@zengchaowu/ui-shared/components/CwFileUpload/types'
import type { CwProfileUploaderProps } from './types'
import { profileUploaderBase } from '@zengchaowu/ui-shared/components/CwProfileUploader/styles'
import { defaultCwProfileUploaderTexts } from '@zengchaowu/ui-shared/components/CwProfileUploader/texts'

interface ProfileFileItem {
  uid: string
  originFile: File
  status: UploadFile['status']
  localPreview?: string
  onlinePreview?: string
}

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function createFileItem(file: File): ProfileFileItem {
  return {
    uid: generateUid(),
    originFile: file,
    status: 'ready',
    localPreview: URL.createObjectURL(file),
  }
}

function revokePreviews(list: ProfileFileItem[]): void {
  list.forEach((item) => {
    if (item.localPreview) {
      URL.revokeObjectURL(item.localPreview)
    }
  })
}

export function CwProfileUploader({
  accept,
  multiple = true,
  maxCount,
  maxSize,
  minSize,
  upload,
  profileImage,
  disabled = false,
  readonly = false,
  deletable = true,
  texts,
  onChange,
  className,
}: CwProfileUploaderProps) {
  const [fileList, setFileList] = useState<ProfileFileItem[]>([])
  const fileListRef = useRef<ProfileFileItem[]>(fileList)
  fileListRef.current = fileList

  const resolvedTexts = useMemo(
    () => ({ ...defaultCwProfileUploaderTexts, ...(texts ?? {}) }),
    [texts],
  )

  const commitFileList = useCallback((next: ProfileFileItem[]) => {
    fileListRef.current = next
    setFileList(next)
  }, [])

  const validateFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (maxSize && file.size > maxSize) return false
      if (minSize && file.size < minSize) return false
      if (accept) {
        const types = accept.split(',').map((t) => t.trim().toLowerCase())
        const ext = '.' + (getFileExtension(file.name) || '')
        const type = file.type.toLowerCase()
        const ok = types.some((a) =>
          a.startsWith('.')
            ? a === ext
            : a.endsWith('/*')
              ? type.startsWith(a.split('/')[0] + '/')
              : a === type,
        )
        if (!ok) return false
      }
      return true
    },
    [accept, maxSize, minSize],
  )

  const patchItem = useCallback((uid: string, patch: Partial<ProfileFileItem>) => {
    const next = fileListRef.current.map((item) =>
      item.uid === uid ? { ...item, ...patch } : item,
    )
    fileListRef.current = next
    setFileList(next)
  }, [])

  const uploadItem = useCallback(
    async (item: ProfileFileItem): Promise<void> => {
      const ok = await validateFile(item.originFile)
      if (!ok) {
        patchItem(item.uid, { status: 'failed' })
        return
      }

      patchItem(item.uid, { status: 'uploading' })

      try {
        const url = await upload(item.originFile)
        patchItem(item.uid, { status: 'success', onlinePreview: url })
      } catch {
        patchItem(item.uid, { status: 'failed' })
      }
    },
    [patchItem, upload, validateFile],
  )

  const append = useCallback(
    (selected: File[]) => {
      if (selected.length === 0) return
      const newItems = selected.map(createFileItem)
      commitFileList([...fileListRef.current, ...newItems])
      newItems.forEach((item) => {
        void uploadItem(item)
      })
    },
    [commitFileList, uploadItem],
  )

  const clear = useCallback(() => {
    revokePreviews(fileListRef.current)
    commitFileList([])
  }, [commitFileList])

  const replaceAt = useCallback(
    (index: number, file: File) => {
      const current = fileListRef.current
      if (index < 0 || index >= current.length) return
      const oldItem = current[index]
      if (oldItem.localPreview) {
        URL.revokeObjectURL(oldItem.localPreview)
      }
      const newItem = createFileItem(file)
      const next = [...current]
      next[index] = newItem
      commitFileList(next)
      void uploadItem(newItem)
    },
    [commitFileList, uploadItem],
  )

  const files = useMemo<UploadFile[]>(
    () =>
      fileList.map((item) => ({
        uid: item.uid,
        name: item.originFile.name,
        size: item.originFile.size,
        type: item.originFile.type,
        status: item.status,
        url: item.localPreview || item.onlinePreview,
        file: item.originFile,
      })),
    [fileList],
  )

  const isFirstFilesEffectRef = useRef(true)
  useEffect(() => {
    if (isFirstFilesEffectRef.current) {
      isFirstFilesEffectRef.current = false
      return
    }
    onChange?.(files)
  }, [files, onChange])

  useEffect(() => {
    return () => {
      revokePreviews(fileListRef.current)
    }
  }, [])

  const handleSelect = (selected: File[]) => {
    const remain = maxCount ? Math.max(0, maxCount - files.length) : selected.length
    append(selected.slice(0, remain))
  }

  const handleRemove = (file: UploadFile) => {
    const rest = files.filter((f) => f.uid !== file.uid)
    clear()
    rest.forEach((f) => append([f.file]))
  }

  const handleItemClick = (file: UploadFile) => {
    const idx = fileListRef.current.findIndex((item) => item.uid === file.uid)
    if (idx < 0) return
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) input.accept = accept
    input.multiple = false
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      const nf = target.files?.[0]
      if (nf) replaceAt(idx, nf)
    }
    input.click()
  }

  const handleFilesChange = (next: UploadFile[]) => {
    const current = fileListRef.current
    const nextItems: ProfileFileItem[] = next.map((file) => {
      const existing = current.find((item) => item.uid === file.uid)
      if (existing) return existing
      return {
        uid: file.uid,
        originFile: file.file,
        status: file.status,
        onlinePreview: file.url,
      }
    })

    current.forEach((item) => {
      if (!nextItems.some((nextItem) => nextItem.uid === item.uid) && item.localPreview) {
        URL.revokeObjectURL(item.localPreview)
      }
    })

    commitFileList(nextItems)
  }

  return (
    <CwFileUpload
      value={files}
      onChange={handleFilesChange}
      appearance="profile"
      accept={accept}
      multiple={multiple}
      maxCount={maxCount}
      disabled={disabled}
      readonly={readonly}
      deletable={deletable}
      onSelect={handleSelect}
      onRemove={handleRemove}
      onItemClick={handleItemClick}
      className={className}
      uploadArea={
        profileImage ? (
          <img
            src={profileImage}
            alt={resolvedTexts.previewImageAlt}
            className={profileUploaderBase.previewImage}
          />
        ) : null
      }
    />
  )
}

export default CwProfileUploader
