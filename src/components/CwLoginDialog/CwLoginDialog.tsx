import CwLoginDialogContent from './CwLoginDialogContent'
import type { CwLoginDialogContentProps } from './types'

export type CwLoginDialogProps = CwLoginDialogContentProps

/**
 * 登录弹窗内容（完整版）。命令式弹窗请使用 `showLoginDialog`。
 */
export function CwLoginDialog(props: CwLoginDialogProps) {
  return <CwLoginDialogContent {...props} />
}

export default CwLoginDialog
