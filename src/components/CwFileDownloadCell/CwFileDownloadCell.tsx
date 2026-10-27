import { useMemo } from 'react'
import type { HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react'
import type { CwFileDownloadCellProps } from './types'
import { fileDownloadCellBase } from '@zengchaowu/ui-shared/components/CwFileDownloadCell/styles'
import { defaultCwFileDownloadCellTexts } from '@zengchaowu/ui-shared/components/CwFileDownloadCell/texts'
import { CwCell } from '../CwCell'
import { CwIcon } from '../CwIcon'
import { CwButton } from '../CwButton'
import { getAssetIconNameByExtension } from '@zengchaowu/shared/functions/file/getAssetIconNameByExtension'

export interface CwFileDownloadCellComponentProps
  extends CwFileDownloadCellProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick' | 'onPause'> {
  className?: string
}

/**
 * CwFileDownloadCell（对应 vue-ui `CwFileDownloadCell.vue`）
 */
export function CwFileDownloadCell({
  fileName,
  fileSize,
  progress,
  disabled = false,
  clickable = false,
  texts: textsProp,
  onClick,
  onDownload,
  onPause,
  onCancel,
  className,
  ...rest
}: CwFileDownloadCellComponentProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwFileDownloadCellTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const iconName = useMemo(
    () =>
      getAssetIconNameByExtension(fileName || '', {
        defaultIcon: 'common--nav--more-apps-line',
      }),
    [fileName],
  )

  // 进度相关
  const clampedProgress = useMemo(() => {
    if (progress == null) return 0
    if (Number.isNaN(progress)) return 0
    return Math.min(100, Math.max(0, progress))
  }, [progress])

  const isDownloading = progress != null && clampedProgress < 100
  const showProgressBar = isDownloading && clampedProgress > 0
  const showProgressText = isDownloading

  // 事件处理
  const handleCellClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(event.nativeEvent)
  }

  const handleDownloadClick = () => {
    if (disabled) return
    onDownload?.()
  }

  const handlePauseClick = () => {
    if (disabled) return
    onPause?.()
  }

  const handleCancelClick = () => {
    if (disabled) return
    onCancel?.()
  }

  // 左侧：图标 + 文本 + 进度条
  const content = (
    <div className={fileDownloadCellBase.contentWrapper}>
      <div className={fileDownloadCellBase.main}>
        {/* 左侧文件类型图标 */}
        <div className={fileDownloadCellBase.iconWrapper}>
          <CwIcon
            name={iconName}
            prefix="icon"
            size={fileDownloadCellBase.iconStyles?.size ?? 1}
            className={fileDownloadCellBase.iconStyles?.class}
          />
        </div>

        {/* 文件名 + 进度条 + 底部信息 */}
        <div className={fileDownloadCellBase.textWrapper}>
          {/* 文件名 */}
          <div className={fileDownloadCellBase.fileName}>{fileName}</div>

          {/* 下载中进度条 */}
          {showProgressBar ? (
            <div className={fileDownloadCellBase.progressBarWrapper}>
              <div className={fileDownloadCellBase.progressTrack}>
                <div
                  className={fileDownloadCellBase.progressFill}
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* 底部信息：左侧大小，右侧百分比或占位 */}
          <div className={fileDownloadCellBase.metaRow}>
            {fileSize ? (
              <span className={fileDownloadCellBase.size}>{fileSize}</span>
            ) : null}
            {showProgressText ? (
              <span className={fileDownloadCellBase.progressText}>
                {Math.round(clampedProgress)}%
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )

  // 右侧：开始 / 暂停 / 取消
  const right = (
    <div className={fileDownloadCellBase.actionWrapper}>
      {/* 下载中：显示暂停 + 取消 */}
      {isDownloading ? (
        <>
          <CwButton
            size="small"
            variant="text"
            type="default"
            appearance="icon"
            shape="circle"
            className={fileDownloadCellBase.actionButtonRoot}
            disabled={disabled}
            onClick={handlePauseClick}
          >
            <span className="sr-only">{texts.pauseAriaLabel}</span>
            <span className={fileDownloadCellBase.actionPauseIcon} aria-hidden="true">
              Ⅱ
            </span>
          </CwButton>
          <CwButton
            size="small"
            variant="text"
            type="default"
            appearance="icon"
            shape="circle"
            className={fileDownloadCellBase.actionButtonRoot}
            disabled={disabled}
            onClick={handleCancelClick}
          >
            <span className="sr-only">{texts.cancelAriaLabel}</span>
            <span className={fileDownloadCellBase.actionCancelIcon} aria-hidden="true">
              ×
            </span>
          </CwButton>
        </>
      ) : (
        /* 非下载中：显示下载按钮 */
        <CwButton
          size="small"
          variant="text"
          type="default"
          appearance="icon"
          shape="circle"
          className={fileDownloadCellBase.actionButtonRoot}
          disabled={disabled}
          onClick={handleDownloadClick}
        >
          <span className="sr-only">{texts.downloadAriaLabel}</span>
          <CwIcon
            name="common--action--download-line"
            prefix="icon"
            size={fileDownloadCellBase.iconButtonIconStyles?.size ?? 1}
            className={fileDownloadCellBase.iconButtonIconStyles?.class}
            aria-hidden="true"
          />
        </CwButton>
      )}
    </div>
  )

  return (
    <div
      {...rest}
      className={[fileDownloadCellBase.root, className].filter(Boolean).join(' ')}
    >
      <CwCell
        showUnderline={false}
        clickable={clickable && !disabled}
        appearance="compact"
        onClick={handleCellClick}
        contentSlot={content}
        rightSlot={right}
      />
    </div>
  )
}

export default CwFileDownloadCell
