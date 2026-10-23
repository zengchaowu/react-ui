import type { CwNameConfirmDialogTexts } from './types'

export const defaultCwNameConfirmDialogTexts: Required<
  Pick<
    CwNameConfirmDialogTexts,
    | 'title'
    | 'message'
    | 'confirmText'
    | 'cancelText'
    | 'inputPlaceholder'
    | 'confirmHintBefore'
    | 'confirmHintAfter'
  >
> = {
  title: '确认',
  message: '确定要执行此操作吗？',
  confirmText: '确认',
  cancelText: '取消',
  inputPlaceholder: '请输入名称',
  confirmHintBefore: '请输入 ',
  confirmHintAfter: ' 以确认',
}
