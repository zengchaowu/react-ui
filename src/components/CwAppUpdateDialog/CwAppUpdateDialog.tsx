import { showDynamicDialog } from '../CwDynamicDialog'
import { CwButton } from '../CwButton'
import type { AppUpdateDialogOptions } from './types'

/**
 * 常见 App 样式的版本更新弹窗：
 * 居中标题「发现新版本」+ 版本号，全宽主按钮「立即更新」，下方文字链「暂不更新」。
 */
export function showAppUpdateDialog(
  options: AppUpdateDialogOptions,
): Promise<boolean> {
  const {
    version,
    notes,
    confirmText = '立即更新',
    cancelText = '暂不更新',
  } = options

  return new Promise((resolve) => {
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }

    const dialog = showDynamicDialog({
      component: (
        <div className="flex w-full min-w-0 flex-col items-center pt-2">
          <div className="text-lg font-semibold text-[var(--text-color-primary)]">
            发现新版本
          </div>
          <div className="mt-1 text-sm font-medium text-[var(--brand-color)]">
            {`v${version}`}
          </div>
          {notes ? (
            <div className="mt-3 w-full min-w-0 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[var(--bg-color-page)] px-3 py-2 text-sm leading-relaxed text-[var(--text-color-secondary)]">
              {notes}
            </div>
          ) : null}
          <CwButton
            type="primary"
            shape="rounded"
            className="mt-5 w-full"
            onClick={() => {
              dialog.close()
              done(true)
            }}
          >
            {confirmText}
          </CwButton>
          <CwButton
            variant="text"
            className="mt-1"
            onClick={() => {
              dialog.close()
              done(false)
            }}
          >
            {cancelText}
          </CwButton>
        </div>
      ),
      config: {
        showCloseButton: false,
        closeOnClickOutside: true,
        content: { class: 'max-w-xs rounded-2xl' },
      },
    })
    // 点击遮罩关闭视为「暂不」
    dialog.promise.then(() => done(false))
  })
}
