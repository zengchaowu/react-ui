import type { ComponentType, ReactNode } from 'react'
import type {
  CwChatStickerPackItem,
  CwChatStickerPickPayload,
} from '@zengchaowu/ui-shared/components/CwChatToolbar/types/stickerPack'
import type { CwChatToolbarAction, CwChatToolbarTexts } from '@zengchaowu/ui-shared/components/CwChatToolbar/types'

export type { CwChatStickerPackItem, CwChatStickerPickPayload } from '@zengchaowu/ui-shared/components/CwChatToolbar/types/stickerPack'

/** 等价 Vue `Component`：可渲染的 React 组件类型 */
export type CwChatToolbarIconComponent = ComponentType<Record<string, unknown>>

/**
 * 工具栏项：纯展示配置 + 可序列化的 action 元数据（由父组件解释）
 */
export interface CwChatToolbarItemConfig {
  key: string
  label: string
  /**
   * CwIcon / asset 的图标名（无 `icon-` 前缀）或 React 组件
   */
  icon?: string | CwChatToolbarIconComponent
  disabled?: boolean
  /**
   * 行为描述，由父组件在 item-click 后处理；不传则父组件可按 key 自行约定
   */
  action?: CwChatToolbarAction
  buttonClass?: string
}

export interface CwChatToolbarProps {
  disabled?: boolean
  items?: CwChatToolbarItemConfig[]
  /** 自定义表情包（表情弹层 Tab） */
  stickerPacks?: CwChatStickerPackItem[]
  rootClass?: string
  texts?: Partial<CwChatToolbarTexts>

  /** 等价 Vue 具名插槽 `prepend` */
  prependSlot?: ReactNode
  /** 等价 Vue 具名插槽 `append` */
  appendSlot?: ReactNode
  /**
   * 等价 Vue 动态具名插槽 `item-{key}`（以 item.key 为 key）；
   * 传函数时以插槽作用域参数渲染。
   */
  itemSlots?: Record<
    string,
    ReactNode | ((scope: CwChatToolbarItemSlotProps) => ReactNode)
  >

  /** 等价 Vue `@item-click` */
  onItemClick?: (item: CwChatToolbarItemConfig) => void
  /** 等价 Vue `@emoji-pick` */
  onEmojiPick?: (emoji: string) => void
  /** 等价 Vue `@sticker-pick` */
  onStickerPick?: (payload: CwChatStickerPickPayload) => void
  /** 等价 Vue `@expression-panel-open` */
  onExpressionPanelOpen?: () => void
}

export interface CwChatToolbarItemSlotProps {
  item: CwChatToolbarItemConfig
  disabled: boolean
  onClick: () => void
  assetIconName: string
  iconComponent: CwChatToolbarIconComponent | null
}
