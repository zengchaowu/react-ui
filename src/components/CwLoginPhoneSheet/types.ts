import type {
  CwLoginPhoneDialogContentProps,
  CwLoginPhoneDialogTexts,
} from '../CwLoginPhoneDialog/types'

export type CwLoginPhoneSheetTexts = CwLoginPhoneDialogTexts

/** Sheet 内容的 React 组件 props（Vue 侧由 h(CwLoginPhoneDialogContent) 传入） */
export interface CwLoginPhoneSheetProps
  extends Omit<CwLoginPhoneDialogContentProps, 'texts' | 'loading' | 'inputSize' | 'layout'> {
  loading?: boolean
  inputSize?: 'small' | 'medium' | 'large'
  layout?: 'dialog' | 'sheet'
  texts?: Partial<CwLoginPhoneSheetTexts>
}

export interface showLoginPhoneSheetOptions {
  texts?: Partial<CwLoginPhoneSheetTexts>
  onSendCode?: (phone: string) => Promise<{ success: boolean; error?: string }>
  onLogin?: (
    phone: string,
    code: string,
  ) => Promise<{ success: boolean; userInfo?: unknown; token?: string; error?: string }>
  onSuccess?: (data: { userInfo: unknown; token: string }) => void
}

export interface showLoginPhoneSheetResult {
  userInfo: unknown
  token: string
}
