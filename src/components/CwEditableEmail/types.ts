import type { HTMLAttributes } from 'react'
import type { CwEditableTextAppearance } from '../CwEditableText/types'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwAutoCompleteEmailTexts } from '../CwAutoCompleteEmail/types'

export type CwEditableEmailAppearance = CwEditableTextAppearance

export interface CwEditableEmailProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onChange' | 'onError'
  > {
  value?: string | null
  asyncModify?: (newValue: string | null) => Promise<boolean>
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  align?: 'left' | 'right'
  appearance?: CwEditableEmailAppearance
  emailSuffixes?: string[]
  debounce?: number
  texts?: Partial<CwEditableEmailTexts>
  className?: string
  /** 值变化（对应 Vue `update:modelValue`） */
  onChange?: (value: string | null) => void
  /** 异步修改成功 */
  onSuccess?: (value: string | null) => void
  /** 异步修改失败 */
  onError?: (error: unknown) => void
}

/** @internal */
export interface CwEditableEmailStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  previewContainer: string
  previewContainerNormal: string
  previewContainerDisabled: string
  previewContainerReadonly: string
  previewContainerFocused: string
  previewText: string
  previewTextNormal: string
  previewTextDisabled: string
  previewTextReadonly: string
  previewTextEmpty: string
  previewTextAlign: string
  editIconContainer: string
  editIconContainerNormal: string
  editIconContainerDisabled: string
  editIconContainerReadonly: string
  editContainer: string
  loadingContainer: string
  iconStyles?: CwIconEmbed
}

export interface CwEditableEmailTexts {
  edit?: string
  placeholder?: string
  autoCompleteEmailTexts?: Partial<CwAutoCompleteEmailTexts>
}

export interface CwEditableEmailEmits {
  'update:modelValue': [value: string | null]
  success: [value: string | null]
  error: [error: unknown]
}
