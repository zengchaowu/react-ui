import type { CwButtonTexts } from '../CwButton/types'
import type { CwDynamicDialogConfig, CwDynamicDialogTexts } from '../CwDynamicDialog/types'

export interface CwNameConfirmDialogTexts {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  inputPlaceholder?: string
  /** Prefix before expected name, e.g. "请输入项目名称 " */
  confirmHintBefore?: string
  /** Suffix after expected name, e.g. " 以确认" */
  confirmHintAfter?: string
  dialogTexts?: Partial<CwDynamicDialogTexts>
  confirmButtonTexts?: Partial<CwButtonTexts>
  cancelButtonTexts?: Partial<CwButtonTexts>
}

export interface CwNameConfirmDialogOptions {
  title?: string
  message?: string
  /** User must type this exact string to enable confirm */
  expectedName: string
  confirmText?: string
  cancelText?: string
  inputPlaceholder?: string
  texts?: Partial<CwNameConfirmDialogTexts>
  dialogConfig?: CwDynamicDialogConfig
}

export type CwNameConfirmDialogResult = boolean

/** @internal */
export interface CwNameConfirmDialogStyles {
  root?: string
  body?: string
  message?: string
  hint?: string
  expected?: string
  footer?: string
}
