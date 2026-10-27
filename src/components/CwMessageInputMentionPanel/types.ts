import type { HTMLAttributes } from 'react'
import type { PopupPluginFunction, VirtualElement } from '../CwPopup/types'
import type { CwMessageInputMentionItem } from '@zengchaowu/ui-shared/components/CwMessageInput/types'

export interface CwMessageInputMentionPanelStyles {
  mentionPanel: string
  /** 内层 listbox 等宽留白（壳无 padding，滚动条贴边） */
  mentionList?: string
  mentionOption: string
  /** 未高亮行 hover（6%）；高亮行改用 mentionOptionKeyboard，勿同挂 */
  mentionOptionHover: string
  mentionOptionKeyboard: string
  mentionAvatarWrap: string
  mentionAvatarImg: string
  mentionAvatarFallback: string
  mentionEmpty: string
}

export interface CwMessageInputMentionPanelTexts {
  mentionNoMatch: string
}

export interface CwMessageInputMentionPanelProps {
  /** 是否显示浮层（Vue `modelValue`） */
  value?: boolean
  /** 兼容别名：部分调用方仍按 Vue 习惯传 `modelValue`；`value` 优先 */
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
  texts?: Partial<CwMessageInputMentionPanelTexts>
  /** 浮层可见性变化（Vue `update:modelValue`） */
  onChange?: (value: boolean) => void
  /** 选中候选项（Vue `select`） */
  onSelect?: (item: CwMessageInputMentionItem) => void
}

export interface CwMessageInputMentionPanelHandle {
  updatePosition: () => void
}

export type CwMessageInputMentionPanelComponentProps = CwMessageInputMentionPanelProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'onSelect'>


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwMessageInputMentionPanelEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: CwMessageInputMentionItem): void
}
