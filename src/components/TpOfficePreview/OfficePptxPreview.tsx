import { useEffect, useRef } from 'react'

export interface OfficePptxPreviewProps {
  src: string
  className?: string
  onRendered?: () => void
  onError?: (error: Error) => void
}

/**
 * PowerPoint(.pptx) 预览（React 等价 @vue-office/pptx）：
 * 使用 pptx-preview 在容器内渲染幻灯片列表。
 */
export function OfficePptxPreview({ src, className, onRendered, onError }: OfficePptxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onRendered, onError })
  callbacksRef.current = { onRendered, onError }

  useEffect(() => {
    const container = containerRef.current
    if (!container || !src) return

    let cancelled = false
    let previewer: { destroy?: () => void } | null = null

    const render = async () => {
      try {
        const { init } = await import('pptx-preview')
        if (cancelled) return

        const response = await fetch(src)
        const arrayBuffer = await response.arrayBuffer()
        if (cancelled) return

        container.innerHTML = ''
        const instance = init(container, {
          width: container.clientWidth || 960,
          height: container.clientHeight || 540,
          mode: 'list',
        })
        previewer = instance
        await instance.preview(arrayBuffer)
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
      previewer?.destroy?.()
      container.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return <div ref={containerRef} className={className} style={{ overflow: 'auto' }} />
}

export default OfficePptxPreview
