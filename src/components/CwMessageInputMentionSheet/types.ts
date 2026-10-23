import type { HTMLAttributes } from 'react'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'

export interface CwMessageInputMentionSheetStyles {
  overlay: string
  overlayVisible: string
  overlayHidden: string
  backdrop: string
  panel: string
  panelVisible: string
  panelHidden: string
  header: string
  list: string
  mentionOption: string
  /** 未高亮行 hover（6%）；高亮行改用 mentionOptionKeyboard，勿同挂 */
  mentionOptionHover: string
  mentionOptionKeyboard: string
  mentionAvatarWrap: string
  mentionAvatarImg: string
  mentionEmpty: string
}

export interface CwMessageInputMentionSheetTexts {
  title: string
  searchPlaceholder: string
  mentionNoMatch: string
}

export interface CwMessageInputMentionSheetProps {
  /** 是否打开 Sheet（Vue `modelValue`） */
  value?: boolean
  /** 兼容别名：部分调用方仍按 Vue 习惯传 `modelValue`；`value` 优先 */
  modelValue?: boolean
  searchQuery?: string
  items: CwMessageInputMentionItem[]
  highlightIndex: number
  mentionAvatarFallbackSrc: string
  optionIdPrefix?: string
  texts?: Partial<CwMessageInputMentionSheetTexts>
  /** Vue `update:modelValue` */
  onChange?: (value: boolean) => void
  /** Vue `update:searchQuery` */
  onSearchQueryChange?: (value: string) => void
  /** Vue `select` */
  onSelect?: (item: CwMessageInputMentionItem) => void
  /** Vue `dismiss` */
  onDismiss?: () => void
}

export type CwMessageInputMentionSheetComponentProps = CwMessageInputMentionSheetProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'onSelect' | 'onDismiss'>
