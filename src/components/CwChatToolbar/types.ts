import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwChatStickerPackItem, CwChatStickerPickPayload } from './types/stickerPack'

export type { CwChatStickerPackItem, CwChatStickerPickPayload } from './types/stickerPack'

/**
 * 声明式「行为」数据，仅供业务页面在 @item-click 后读取；
 * CwChatToolbar 不解析、不执行。
 */
export type CwChatToolbarAction =
  | { type: 'emit' }
  | { type: 'open-file-picker'; accept: string; multiple?: boolean }

/** 业务层对工具栏行为归一后的载荷（Toolbar 自身不发出） */
export type CwChatToolbarActionPayload =
  | { kind: 'tap'; key: string }
  | { kind: 'file'; key: string; files: FileList }

/**
 * 工具栏项：纯展示配置 + 可序列化的 action 元数据（由父组件解释）
 */
export interface CwChatToolbarItemConfig {
  key: string
  label: string
  /**
   * CwIcon / iconfont 的图标名（无 `icon-` 前缀）或 Vue 组件
   */
  icon?: string | ComponentType<any>
  disabled?: boolean
  /**
   * 行为描述，由父组件在 item-click 后处理；不传则父组件可按 key 自行约定
   */
  action?: CwChatToolbarAction
  buttonClass?: string
}

export interface CwChatToolbarStyles {
  root: string
  cluster: string
  itemButton: string
}

export interface CwChatToolbarTexts {
  /** icon 缺失或无效时的 iconfont 名（无 `icon-` 前缀） */
  fallbackIconfont: string
  /** EmojiOne 分类 Tab 显示名（key 为英文分类 id） */
  emojiCategoryLabels?: Record<string, string>
  /** 表情/贴纸面板：常用 emoji Tab */
  emojiTabAriaLabel: string
  /** 贴纸包为空时的占位文案 */
  emptyStickerPackLabel: string
  /** 单个贴纸无名称时的 aria-label */
  stickerFallbackAriaLabel: string
  /** 全量表情分类面板加载中文案 */
  emojiPanelLoadingLabel: string
}

export interface CwChatToolbarProps {
  disabled?: boolean
  items?: CwChatToolbarItemConfig[]
  /** 自定义表情包（表情弹层 Tab） */
  stickerPacks?: CwChatStickerPackItem[]
  rootClass?: string
  styles?: Partial<CwChatToolbarStyles>
  texts?: Partial<CwChatToolbarTexts>
}

export interface CwChatToolbarItemSlotProps {
  item: CwChatToolbarItemConfig
  disabled: boolean
  onClick: () => void
  iconfontName: string
  iconComponent: ComponentType<any> | null
}
