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
  mentionOptionActive: string
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
  modelValue?: boolean
  searchQuery?: string
  items: CwMessageInputMentionItem[]
  highlightIndex: number
  mentionAvatarFallbackSrc: string
  optionIdPrefix?: string
  styles?: Partial<CwMessageInputMentionSheetStyles>
  texts?: Partial<CwMessageInputMentionSheetTexts>
}

export interface CwMessageInputMentionSheetEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:searchQuery', value: string): void
  (e: 'select', item: CwMessageInputMentionItem): void
  (e: 'dismiss'): void
}
