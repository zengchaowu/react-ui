import type { ReactNode } from 'react'
import { CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { showDynamicDialog } from '../CwDynamicDialog'
import CwButton from '../CwButton/CwButton'
import type { CwConfirmDialogOptions } from './types'
import type { CwConfirmDialogResult } from '@zengchaowu/ui-shared/components/CwConfirmDialog/types'
import { confirmDialogBase } from '@zengchaowu/ui-shared/components/CwConfirmDialog/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwConfirmDialog/texts'

/**
 * 显示确认对话框
 * @param options 对话框配置选项
 * @returns Promise，resolve 时返回 'confirm' 或 'cancel'
 */
export function showConfirmDialog(
  options: CwConfirmDialogOptions = {},
): Promise<CwConfirmDialogResult> {
  return new Promise((resolve) => {
    const {
      title = '确认',
      message = '确定要执行此操作吗？',
      confirmText = '确认',
      cancelText = '取消',
      confirmType = 'primary',
      cancelType = 'default',
      showCancel = true,
      showTitleInHeader = true,
      showTitleInContent = false,
      texts: customTexts,
      dialogConfig = {},
    } = options

    const styles = confirmDialogBase
    const texts = { ...defaultTexts, ...customTexts }

    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    // 处理确认
    const handleConfirm = () => {
      if (isResolved) return
      isResolved = true
      if (dialogInstance) {
        dialogInstance.close()
      }
      // 延迟 resolve，等待 Dialog 关闭动画完成（300ms 与 CwDynamicDialog 动画时间一致）
      setTimeout(() => {
        resolve('confirm')
      }, 300)
    }

    // 处理取消
    const handleCancel = () => {
      if (isResolved) return
      isResolved = true
      if (dialogInstance) {
        dialogInstance.close()
      }
      // 延迟 resolve，等待 Dialog 关闭动画完成（300ms 与 CwDynamicDialog 动画时间一致）
      setTimeout(() => {
        resolve('cancel')
      }, 300)
    }

    const messageBlock =
      title && showTitleInContent ? (
        <div className={styles.title}>{title}</div>
      ) : null
    const messageBody = message ? (
      <div className={styles.message}>{message}</div>
    ) : null

    const footer: ReactNode = (
      <div className={styles.footer}>
        {showCancel ? (
          <CwButton
            type={cancelType}
            texts={texts.cancelButtonTexts}
            onClick={handleCancel}
          >
            {cancelText}
          </CwButton>
        ) : null}
        <CwButton
          type={confirmType}
          texts={texts.confirmButtonTexts}
          onClick={handleConfirm}
        >
          {confirmText}
        </CwButton>
      </div>
    )

    // 顶栏标题与正文大标题二选一（或 dialogConfig.header 自定义）
    const header: ReactNode =
      title && showTitleInHeader ? (
        <div className={CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS}>{title}</div>
      ) : (
        dialogConfig.header
      )

    const component: ReactNode = (
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4">
        <div className={styles.content}>
          {messageBlock}
          {messageBody}
        </div>
        {footer}
      </div>
    )

    dialogInstance = showDynamicDialog({
      component,
      config: {
        ...dialogConfig,
        header,
        closeOnClickOutside: dialogConfig.closeOnClickOutside ?? true,
      },
    })

    // 监听 Promise resolve，当用户点击外部关闭时 resolve 为 'cancel'
    dialogInstance.promise.then(() => {
      if (!isResolved) {
        // 用户点击外部关闭，延迟 resolve，等待 Dialog 关闭动画完成
        setTimeout(() => {
          resolve('cancel')
        }, 300)
      }
    })
  })
}
