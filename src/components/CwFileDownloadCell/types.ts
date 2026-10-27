
import type { CwFileDownloadCellTexts } from '@zengchaowu/ui-shared/components/CwFileDownloadCell/types'

export interface CwFileDownloadCellProps {
  /** 文件名（包含扩展名，用于显示和推导图标） */
  fileName: string
  /** 文件大小展示文案，例如 `2.5 MB`、`856 KB` */
  fileSize?: string
  /** 下载进度（0-100，存在时显示进度条和百分比） */
  progress?: number
  /** 是否禁用交互 */
  disabled?: boolean
  /** 整行是否可点击 */
  clickable?: boolean
  /** 自定义文案 */
  texts?: Partial<CwFileDownloadCellTexts>
  /** 点击整行（不包含右侧按钮的独立点击） */
  onClick?: (event: MouseEvent) => void
  /** 点击下载按钮 */
  onDownload?: () => void
  /** 下载中点击暂停按钮 */
  onPause?: () => void
  /** 下载中点击取消按钮 */
  onCancel?: () => void
  className?: string
}

export interface CwFileDownloadCellEmits {
  /** 点击整行（不包含右侧按钮的独立点击） */
  onClick?: (event: MouseEvent) => void
  /** 点击下载按钮 */
  onDownload?: () => void
  /** 下载中点击暂停按钮 */
  onPause?: () => void
  /** 下载中点击取消按钮 */
  onCancel?: () => void
}
