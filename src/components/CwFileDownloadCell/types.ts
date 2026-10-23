import type { CwIconEmbed } from '../CwIcon/types'

export interface CwFileDownloadCellStyles {
  /** 外层卡片容器 */
  root: string
  /** 左侧整体内容包装（图标 + 文本列） */
  contentWrapper: string
  /** 主行布局（图标 + 文本 + 按钮） */
  main: string
  /** 左侧图标容器 */
  iconWrapper: string
  /** 文本区域容器 */
  textWrapper: string
  /** 文件名样式 */
  fileName: string
  /** 次级信息行（大小、进度等） */
  metaRow: string
  /** 文件大小样式 */
  size: string
  /** 进度文字样式 */
  progressText: string
  /** 进度条外层容器 */
  progressBarWrapper: string
  /** 进度条轨道 */
  progressTrack: string
  /** 进度条填充 */
  progressFill: string
  /** 右侧操作区域容器 */
  actionWrapper: string
  /** 右侧图标按钮根样式 */
  actionButtonRoot: string
  /** 右侧图标按钮内容区域样式 */
  actionButtonContent: string
  /** 暂停按钮内图标样式 */
  actionPauseIcon: string
  /** 取消按钮内图标样式 */
  actionCancelIcon: string
  /** 图标样式配置 */
  iconStyles?: CwIconEmbed
  /** 右侧图标按钮内图标样式配置 */
  iconButtonIconStyles?: CwIconEmbed
}

export interface CwFileDownloadCellTexts {
  downloadAriaLabel: string
  pauseAriaLabel: string
  cancelAriaLabel: string
}

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
