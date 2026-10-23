import { useEffect, useState } from 'react'

export interface OfficeExcelPreviewProps {
  src: string
  className?: string
  onRendered?: () => void
  onError?: (error: Error) => void
}

/**
 * Excel(.xlsx)/CSV 预览（React 等价 @vue-office/excel）：
 * 使用 SheetJS(xlsx) 将每个工作表渲染为 HTML 表格。
 */
export function OfficeExcelPreview({ src, className, onRendered, onError }: OfficeExcelPreviewProps) {
  const [sheetsHtml, setSheetsHtml] = useState<Array<{ name: string; html: string }>>([])
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!src) return

    let cancelled = false

    const render = async () => {
      try {
        const XLSX = await import('xlsx')
        if (cancelled) return

        const response = await fetch(src)
        const arrayBuffer = await response.arrayBuffer()
        if (cancelled) return

        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const next = workbook.SheetNames.map((name) => ({
          name,
          html: XLSX.utils.sheet_to_html(workbook.Sheets[name]),
        }))
        if (!cancelled) {
          setSheetsHtml(next)
          onRendered?.()
        }
      } catch (err) {
        if (!cancelled) {
          const normalized = err instanceof Error ? err : new Error(String(err))
          setError(normalized)
          onError?.(normalized)
        }
      }
    }

    void render()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (error) {
    return null
  }

  return (
    <div className={className} style={{ overflow: 'auto' }}>
      {sheetsHtml.map((sheet) => (
        <div key={sheet.name} className="tp-office-preview-sheet">
          <div className="px-3 py-2 text-sm font-bold text-[var(--text-color-primary)] hairline-border-b border-[var(--border-color)]">
            {sheet.name}
          </div>
          <div
            className="tp-office-preview-sheet-content"
            dangerouslySetInnerHTML={{ __html: sheet.html }}
          />
        </div>
      ))}
    </div>
  )
}

export default OfficeExcelPreview
