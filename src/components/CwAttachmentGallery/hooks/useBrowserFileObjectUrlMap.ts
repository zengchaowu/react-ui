import { useEffect, useMemo, useRef } from 'react'

export interface FileObjectUrlEntry {
  key: string | number
  file: File
  objectUrl?: string
  needsBlobUrl: boolean
}

/**
 * 按 key 维护 File → blob URL，自动 revoke 不再使用的 URL。
 * 对应 Vue `useBrowserFileObjectUrlMap`。
 */
export function useBrowserFileObjectUrlMap(entries: FileObjectUrlEntry[]) {
  const urlByKeyRef = useRef<Map<string | number, string>>(new Map())

  const signature = entries
    .map(
      (entry) =>
        `${String(entry.key)}\u0000${entry.needsBlobUrl ? 1 : 0}\u0000${entry.objectUrl ?? ''}`,
    )
    .join('\u0001')

  // 渲染期同步生成缺失的 object URL，保证首帧即可拿到资源地址
  const urlByKey = useMemo(() => {
    const previous = urlByKeyRef.current
    const next = new Map<string | number, string>()
    for (const entry of entries) {
      if (!entry.needsBlobUrl) continue
      const external = entry.objectUrl?.trim()
      if (external) {
        next.set(entry.key, external)
        continue
      }
      const existing = previous.get(entry.key)
      if (existing) {
        next.set(entry.key, existing)
        continue
      }
      next.set(entry.key, URL.createObjectURL(entry.file))
    }
    return next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  useEffect(() => {
    const previous = urlByKeyRef.current
    urlByKeyRef.current = urlByKey
    for (const [key, url] of previous) {
      if (urlByKey.get(key) !== url) URL.revokeObjectURL(url)
    }
  }, [urlByKey])

  useEffect(() => {
    return () => {
      for (const url of urlByKeyRef.current.values()) {
        URL.revokeObjectURL(url)
      }
      urlByKeyRef.current = new Map()
    }
  }, [])

  function resolve(entry: FileObjectUrlEntry): string {
    const external = entry.objectUrl?.trim()
    if (external) return external
    return urlByKey.get(entry.key) ?? ''
  }

  return { resolve }
}
