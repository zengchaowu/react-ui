/**
 * Chrome 风格标签页组件类型定义
 */
export interface CwChromeTabItem {
  /** 标签唯一标识 */
  id: string | number
  /** 标签显示文案 */
  label: string
  /** 图标 SVG 字符串（可选，如网站 favicon） */
  icon?: string
  /** 是否可关闭，默认根据组件 closable prop */
  closable?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/** 内部结构类（不对外暴露 styles 覆盖） */
export interface CwChromeTabStyleSlots {
  root: string
  bar: string
  addButton: string
  addIcon: string
  tab: string
  tabGap: string
  tabActive: string
  tabInactive: string
  tabDisabled: string
  tabLabel: string
  tabIcon: string
  tabIconSlot: string
  closeButton: string
  closeButtonFocus: string
  closeIcon: string
}

/** @deprecated 使用组件内置 appearance；勿再对外传 styles */
export type CwChromeTabStyles = CwChromeTabStyleSlots

export type CwChromeTabAppearance = 'default' | 'browser'

export interface CwChromeTabTexts {
  /** 关闭按钮无障碍标签 */
  closeButtonLabel: string
  /** 添加标签按钮无障碍标签 */
  addButtonLabel: string
  /** 标签列表无障碍名称 */
  tablistLabel: string
}

export interface CwChromeTabProps {
  /** 标签列表 */
  tabs: CwChromeTabItem[]
  /** 当前激活的标签 id（v-model:activeId） */
  activeId?: string | number | null
  /** 是否可关闭标签 */
  closable?: boolean
  /** 是否显示添加标签按钮 */
  addable?: boolean
  /**
   * 外观变体：
   * - `default`：通用 Chrome 标签栏
   * - `browser`：浏览器应用标签条（可横向滚动、更宽文案）
   */
  appearance?: CwChromeTabAppearance
  /** 自定义文案 */
  texts?: Partial<CwChromeTabTexts>
  /** 标签顶部是否圆角，可传入圆角大小，如 'md' 'lg' 'xl' '2xl'，默认 ''（无圆角） */
  topRounded?: string
}

export interface CwChromeTabEmits {
  (e: 'update:activeId', id: string | number | null): void
  (e: 'close', id: string | number, index: number): void
  (e: 'add'): void
  (e: 'change', id: string | number | null, index: number, tab: CwChromeTabItem | null): void
  (e: 'reorder', tabs: CwChromeTabItem[], draggedId: string | number, fromIndex: number, toIndex: number): void
}
