import CwLoginPhoneDialogContent from './CwLoginPhoneDialogContent'
import type { CwLoginPhoneDialogProps } from './types'

/**
 * 手机号登录内容（对话框布局）。
 * 命令式弹窗请使用 `showLoginPhoneDialog`。
 */
export function CwLoginPhoneDialog({
  layout = 'dialog',
  ...rest
}: CwLoginPhoneDialogProps) {
  return <CwLoginPhoneDialogContent {...rest} layout={layout} />
}

export default CwLoginPhoneDialog
