export interface AppUpdateDialogOptions {
  /** 新版本号，如 1.0.157 */
  version: string
  /** 更新说明（可选，逐条或整段） */
  notes?: string
  confirmText?: string
  cancelText?: string
}
