export interface CwInlineRenameLabelTexts {
  renamePrefix: string
}

export interface CwInlineRenameLabelProps {
  name: string
  renaming: boolean
  asyncModify: (newValue: string) => Promise<boolean>
  labelClass?: string
  align?: 'left' | 'right'
  texts?: Partial<CwInlineRenameLabelTexts>
  /** 取消重命名（未修改退出或按 Esc） */
  onCancel?: () => void
  /** 重命名成功 */
  onSuccess?: (name: string) => void
  className?: string
}
