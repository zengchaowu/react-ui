import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { getFileExtension } from '@zengchaowu/shared/functions/file/getFileExtension'
import { mediaProbePathFromUrl } from '@zengchaowu/shared/functions/file/mediaProbePathFromUrl'
import { CwIcon } from '../CwIcon'
import OfficePdfPreview from './OfficePdfPreview'
import OfficeDocxPreview from './OfficeDocxPreview'
import OfficeExcelPreview from './OfficeExcelPreview'
import OfficePptxPreview from './OfficePptxPreview'
import type { TpOfficePreviewProps } from './types'
import { officePreviewBase } from './styles'
import { defaultTexts } from './texts'

// 将 CSV 转换为 Excel 格式
const convertCsvToExcel = (csvText: string, delimiter: string = ','): Blob => {
  // 解析 CSV 数据
  const lines = csvText.split('\n').filter((line) => line.trim())
  const data = lines.map((line) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  })

  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 生成 Excel 文件
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // 创建 Blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function TpOfficePreview({
  src,
  fileType: fileTypeProp,
  showRetry = true,
  className,
  texts: textsProp = defaultTexts,
  onRendered,
  onError,
  onLoading,
}: TpOfficePreviewProps) {
  const texts = textsProp || defaultTexts

  // 响应式状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [componentLoading, setComponentLoading] = useState(false) // 组件加载状态
  const [retryCount, setRetryCount] = useState(0)

  const callbacksRef = useRef({ onRendered, onError, onLoading })
  callbacksRef.current = { onRendered, onError, onLoading }

  // 计算文件类型
  const fileType = useMemo(() => {
    // 如果传入了fileType参数，优先使用该参数
    if (fileTypeProp) {
      return fileTypeProp
    }

    if (!src) return ''

    const url = typeof src === 'string' ? src : src?.url
    const extension = getFileExtension(mediaProbePathFromUrl(url ?? ''))

    switch (extension) {
      case 'pdf':
        return 'pdf'
      case 'docx':
        return 'docx'
      case 'xlsx':
        return 'xlsx'
      case 'pptx':
        return 'pptx'
      case 'csv':
        return 'csv'
      default:
        return 'unsupported'
    }
  }, [fileTypeProp, src])

  // 根据文件类型预加载对应渲染库（对应 Vue 动态加载 @vue-office/* 组件）
  useEffect(() => {
    if (!fileType) return

    let cancelled = false

    const loadComponentByFileType = async () => {
      setComponentLoading(true)
      try {
        switch (fileType) {
          case 'pdf':
            await import('pdfjs-dist')
            break
          case 'docx':
            await import('docx-preview')
            break
          case 'pptx':
            await import('pptx-preview')
            break
          case 'xlsx':
          case 'csv':
            await import('xlsx')
            break
        }
      } catch (err) {
        console.error('Failed to load component:', err)
        if (!cancelled) {
          setError('组件加载失败')
        }
      } finally {
        if (!cancelled) {
          setComponentLoading(false)
        }
      }
    }

    void loadComponentByFileType()

    return () => {
      cancelled = true
    }
  }, [fileType])

  // 处理文档加载（对应 Vue watch src immediate）
  useEffect(() => {
    let cancelled = false
    let createdBlobUrl = ''

    const loadDocument = async () => {
      if (!src) {
        setDocumentUrl('')
        return
      }

      setLoading(true)
      setError('')
      callbacksRef.current.onLoading?.()

      try {
        if (typeof src === 'string') {
          // 字符串 URL
          if (fileType === 'csv') {
            // CSV 文件需要转换为 Excel 格式
            const response = await fetch(src)
            const csvText = await response.text()
            const excelBlob = convertCsvToExcel(csvText, ',')
            createdBlobUrl = URL.createObjectURL(excelBlob)
            if (!cancelled) setDocumentUrl(createdBlobUrl)
          } else {
            if (!cancelled) setDocumentUrl(src)
          }
        } else {
          // 处理文档源对象
          const { file, url, arrayBuffer, blob } = src

          if (file) {
            // File 对象
            if (fileType === 'csv') {
              const csvText = await file.text()
              const excelBlob = convertCsvToExcel(csvText, ',')
              createdBlobUrl = URL.createObjectURL(excelBlob)
            } else {
              createdBlobUrl = URL.createObjectURL(file)
            }
            if (!cancelled) setDocumentUrl(createdBlobUrl)
          } else if (url) {
            // URL 字符串
            if (fileType === 'csv') {
              const response = await fetch(url)
              const csvText = await response.text()
              const excelBlob = convertCsvToExcel(csvText, ',')
              createdBlobUrl = URL.createObjectURL(excelBlob)
              if (!cancelled) setDocumentUrl(createdBlobUrl)
            } else {
              if (!cancelled) setDocumentUrl(url)
            }
          } else if (arrayBuffer) {
            // ArrayBuffer 数据
            if (fileType === 'csv') {
              const csvText = new TextDecoder('utf-8').decode(arrayBuffer)
              const excelBlob = convertCsvToExcel(csvText, ',')
              createdBlobUrl = URL.createObjectURL(excelBlob)
            } else {
              const nextBlob = new Blob([arrayBuffer])
              createdBlobUrl = URL.createObjectURL(nextBlob)
            }
            if (!cancelled) setDocumentUrl(createdBlobUrl)
          } else if (blob) {
            // Blob 数据
            if (fileType === 'csv') {
              const csvText = await blob.text()
              const excelBlob = convertCsvToExcel(csvText, ',')
              createdBlobUrl = URL.createObjectURL(excelBlob)
            } else {
              createdBlobUrl = URL.createObjectURL(blob)
            }
            if (!cancelled) setDocumentUrl(createdBlobUrl)
          } else {
            throw new Error('无效的文档源')
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '文档加载失败'
          setError(message)
          callbacksRef.current.onError?.(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDocument()

    return () => {
      cancelled = true
      // 清理资源（对应 Vue cleanup）
      if (createdBlobUrl && createdBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdBlobUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fileType, retryCount])

  // 处理渲染完成
  const handleRendered = useCallback(() => {
    setLoading(false)
    callbacksRef.current.onRendered?.()
  }, [])

  // 处理错误
  const handleError = useCallback((err: unknown) => {
    setLoading(false)
    const message = err instanceof Error ? err.message : '文档渲染失败'
    setError(message)
    callbacksRef.current.onError?.(message)
  }, [])

  // 处理重试
  const handleRetry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  const showLoading = loading || componentLoading

  return (
    <div className={[officePreviewBase.root, className].filter(Boolean).join(' ')}>
      {/* 加载状态 */}
      {showLoading && (
        <div className={officePreviewBase.loadingContainer}>
          <div className={officePreviewBase.loadingContent}>
            <div className={officePreviewBase.loadingSpinner}></div>
            <p className={officePreviewBase.loadingText}>
              {componentLoading ? texts.loadingComponent : texts.loadingDocument}
            </p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {!showLoading && error && (
        <div className={officePreviewBase.errorContainer}>
          <div className={officePreviewBase.errorContent}>
            <div className={officePreviewBase.errorIcon}>
              <CwIcon
                name="common--status--info-filled"
                prefix="icon"
                size={1.5}
                className={officePreviewBase.errorIconSvg}
              />
            </div>
            <p className={officePreviewBase.errorTitle}>{texts.errorTitle}</p>
            <p className={officePreviewBase.errorMessage}>{error}</p>
            {showRetry && (
              <div onClick={handleRetry} className={officePreviewBase.retryButton}>
                {texts.retryText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 文档预览内容 */}
      {!showLoading && !error && documentUrl && (
        <div className={officePreviewBase.previewContainer}>
          {/* PDF 预览 */}
          {fileType === 'pdf' && (
            <OfficePdfPreview
              src={documentUrl}
              onRendered={handleRendered}
              onError={handleError}
              className="w-full h-full min-w-[50rem]"
            />
          )}

          {/* Word 预览 */}
          {fileType === 'docx' && (
            <OfficeDocxPreview
              src={documentUrl}
              onRendered={handleRendered}
              onError={handleError}
              className="w-full h-full min-w-[50rem]"
            />
          )}

          {/* Excel 预览 */}
          {fileType === 'xlsx' && (
            <OfficeExcelPreview
              src={documentUrl}
              onRendered={handleRendered}
              onError={handleError}
              className="w-full h-full"
            />
          )}

          {/* PowerPoint 预览 */}
          {fileType === 'pptx' && (
            <OfficePptxPreview
              src={documentUrl}
              onRendered={handleRendered}
              onError={handleError}
              className="w-full h-full"
            />
          )}

          {/* CSV 预览（转换为 Excel 格式） */}
          {fileType === 'csv' && (
            <OfficeExcelPreview
              src={documentUrl}
              onRendered={handleRendered}
              onError={handleError}
              className="w-full h-full"
            />
          )}

          {/* 不支持的文件类型 */}
          {fileType !== 'pdf' &&
            fileType !== 'docx' &&
            fileType !== 'xlsx' &&
            fileType !== 'pptx' &&
            fileType !== 'csv' && (
              <div className={officePreviewBase.unsupportedContainer}>
                <div className={officePreviewBase.unsupportedContent}>
                  <div className={officePreviewBase.unsupportedIcon}>
                    <CwIcon
                      name="common--nav--file-line"
                      prefix="icon"
                      size={1.5}
                      className={officePreviewBase.unsupportedIconSvg}
                    />
                  </div>
                  <p className={officePreviewBase.unsupportedTitle}>不支持的文件类型</p>
                  <p className={officePreviewBase.unsupportedMessage}>
                    仅支持 PDF、Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx) 和 CSV 文件
                  </p>
                </div>
              </div>
            )}
        </div>
      )}

      {/* 无文档状态 */}
      {!showLoading && !error && !documentUrl && (
        <div className={officePreviewBase.unsupportedContainer}>
          <div className={officePreviewBase.unsupportedContent}>
            <div className={officePreviewBase.unsupportedIcon}>
              <CwIcon
                name="common--nav--file-line"
                prefix="icon"
                size={1.5}
                className={officePreviewBase.unsupportedIconSvg}
              />
            </div>
            <p className={officePreviewBase.unsupportedTitle}>请选择要预览的文档</p>
            <p className={officePreviewBase.unsupportedMessage}>
              支持 PDF、Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx) 和 CSV 格式
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TpOfficePreview
