import { useEffect, useRef } from 'react'

export interface OfficeDocxPreviewProps {
  src: string
  className?: string
  onRendered?: () => void
  onError?: (error: Error) => void
}

/**
 * Word(.docx) 预览（React 等价 @vue-office/docx）：
 * 使用 docx-preview 将文档渲染为 HTML。
 */
export function OfficeDocxPreview({ src, className, onRendered, onError }: OfficeDocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onRendered, onError })
  callbacksRef.current = { onRendered, onError }

  useEffect(() => {
    const container = containerRef.current
    if (!container || !src) return

    let cancelled = false

    const render = async () => {
      try {
        const { renderAsync } = await import('docx-preview')
        if (cancelled) return

        const response = await fetch(src)
        const arrayBuffer = await response.arrayBuffer()
        if (cancelled) return

        container.innerHTML = ''
        await renderAsync(arrayBuffer, container, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: true,
        })
        if (!cancelled) {
          callbacksRef.current.onRendered?.()
        }
      } catch (error) {
        if (!cancelled) {
          callbacksRef.current.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          )
        }
      }
    }

    void render()

    return () => {
      cancelled = true
      container.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return <div ref={containerRef} className={className} style={{ overflow: 'auto' }} />
}

export default OfficeDocxPreview
