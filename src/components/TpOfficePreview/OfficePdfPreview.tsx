import { useEffect, useRef, useState } from 'react'

export interface OfficePdfPreviewProps {
  src: string
  className?: string
  onRendered?: () => void
  onError?: (error: Error) => void
}

/**
 * PDF 预览（React 等价 @vue-office/pdf）：
 * 使用 pdfjs-dist 将每一页渲染为 canvas。
 */
export function OfficePdfPreview({ src, className, onRendered, onError }: OfficePdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(0)
  const callbacksRef = useRef({ onRendered, onError })
  callbacksRef.current = { onRendered, onError }

  useEffect(() => {
    const container = containerRef.current
    if (!container || !src) return

    let cancelled = false

    const render = async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        if (cancelled) return

        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString()
        }

        const loadingTask = pdfjs.getDocument({ url: src })
        const pdf = await loadingTask.promise
        if (cancelled) return

        setPageCount(pdf.numPages)

        // 等待 canvas 节点渲染完成
        await new Promise((resolve) => setTimeout(resolve, 0))
        if (cancelled) return

        const canvases = container.querySelectorAll('canvas')
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return
          const page = await pdf.getPage(pageNum)
          if (cancelled) return
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = canvases[pageNum - 1]
          if (!canvas) continue
          const context = canvas.getContext('2d')
          if (!context) continue
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: context, viewport }).promise
        }

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'auto' }}>
      {Array.from({ length: pageCount }, (_, index) => (
        <canvas key={index} style={{ display: 'block', margin: '0 auto' }} />
      ))}
    </div>
  )
}

export default OfficePdfPreview
