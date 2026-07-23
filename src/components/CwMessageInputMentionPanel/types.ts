import type { PopupPluginFunction, VirtualElement } from '../CwPopup/types/state'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'

export interface CwMessageInputMentionPanelStyles {
  mentionPanel: string
  mentionOption: string
  mentionOptionActive: string
  mentionAvatarWrap: string
  mentionAvatarImg: string
  mentionAvatarFallback: string
  mentionEmpty: string
}

export interface CwMessageInputMentionPanelTexts {
  mentionNoMatch: string
}

export interface CwMessageInputMentionPanelProps {
  /** 与 CwPopup `modelValue` 一致：是否显示浮层 */
  modelValue?: boolean
  /** 定位锚点（通常为光标处的 VirtualElement） */
  virtualReference?: VirtualElement
  /** 覆盖默认 CwPopup 插件链 */
  plugins?: PopupPluginFunction[]
  /** 过滤后的候选项 */
  items: CwMessageInputMentionItem[]
  /** 必传：候选行 `CwAvatar` 的 `fallback-src`（无头像 URL 或主图加载失败） */
  mentionAvatarFallbackSrc: string
  /** 键盘/鼠标高亮项下标 */
  highlightIndex: number
  /** listbox 选项 `id` 前缀，需全局唯一时可改 */
  optionIdPrefix?: string
  styles?: Partial<CwMessageInputMentionPanelStyles>
  texts?: Partial<CwMessageInputMentionPanelTexts>
}

export interface CwMessageInputMentionPanelEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: CwMessageInputMentionItem): void
}
