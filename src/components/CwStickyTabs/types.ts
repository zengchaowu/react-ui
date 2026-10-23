import type { HTMLAttributes, RefObject } from 'react'

/**
 * 吸顶 Tab：sticky 吸顶 + 与滚动容器联动，滚动时自动高亮当前区块对应 Tab，点击 Tab 平滑滚动到对应区块。
 */
export interface CwStickyTabItem {
  /** Tab 显示文字 */
  label: string
  /** 用于滚动定位或业务标识，与 getSectionEl 配合 */
  refName?: string
  /** 可选业务标识 */
  value?: string
}

export interface CwStickyTabsStyles {
  /** 根容器（sticky 吸顶） */
  root: string
  /** 头部包裹 */
  header: string
  /** Tab 列表 */
  list: string
  /** 单个 Tab 项 */
  item: string
  /** Tab 激活状态 */
  itemActive: string
  /** Tab 文案 */
  itemText: string
  /** Tab 文案激活态（下划线等） */
  itemTextActive: string
}

export interface CwStickyTabsTexts {
  /** 标签列表无障碍名称 */
  tablistLabel?: string
}

export interface CwStickyTabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tab 配置列表 */
  tabs?: CwStickyTabItem[]
  /**
   * 滚动容器元素或 ref。不传且传了 getSectionEl 时会自动从 DOM 查找可滚动祖先。
   */
  scrollContainerRef?:
    | HTMLElement
    | RefObject<HTMLElement | null>
    | null
  /**
   * 根据 refName 获取区块 DOM，用于跟随滚动选中与点击滚动到区块。
   */
  getSectionEl?: (refName: string) => HTMLElement | null
  /** 受控：当前激活的 tab 索引（对应 `v-model:activeIndex`） */
  activeIndex?: number
  /** 导航条高度（px），用于滚动偏移与 scroll-margin，默认 45 */
  navHeight?: number
  texts?: Partial<CwStickyTabsTexts>
  /** 受控时滚动同步选中会触发（对应 `update:activeIndex`） */
  onActiveIndexChange?: (index: number) => void
  /** Tab 点击（对应 `tabClick`） */
  onTabClick?: (index: number, tab: CwStickyTabItem) => void
}

export interface CwStickyTabsEmits {
  /** Tab 点击：index, tab */
  onTabClick?: (index: number, tab: CwStickyTabItem) => void
  /** 受控时滚动同步选中会触发 */
  onActiveIndexChange?: (index: number) => void
}

/** defineExpose 暴露的实例方法 */
export interface CwStickyTabsHandle {
  readonly activeIndex: number
  updateActiveIndexFromScroll: () => void
}
