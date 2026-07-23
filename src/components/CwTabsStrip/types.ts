import type { CwBadgeProps } from '../CwBadge'

export type CwTabsStripValue = string | number

/**
 * Tab 条：横向/纵向、滚动或等分、底部（或侧向）指示器，可选角标。
 */
export interface CwTabsStripItem {
  /** 显示文案 */
  label: string
  /** 唯一值，用于 `v-model:model-value`（与 `key` 二选一或同时传，取值优先 `value`） */
  value?: CwTabsStripValue
  /** 与 CwTabs 对齐的键，等价于未传 `value` 时的取值 */
  key?: CwTabsStripValue
  /** 自定义无障碍标签 */
  ariaLabel?: string
  /** 是否禁用单项 */
  disabled?: boolean
  /** 透传 `CwBadge`；与 `count` / `mark` 同时存在时以此为准 */
  badge?: Partial<CwBadgeProps>
  /** 未读数等，显示为数字角标 */
  count?: number | null
  /**
   * 角标简写：`true` 红点；正数为数字角标（与 `count` 同时存在时优先 `count`）
   */
  mark?: number | boolean
}

export interface CwTabsStripStyles {
  /** 根容器（基础，不含方向） */
  root: string
  /** 横向布局 */
  rootHorizontal: string
  /** 纵向布局 */
  rootVertical: string
  /** 等分宽度时的根容器（横向） */
  rootEqualWidth: string
  /** 非等分横向滚动 */
  rootScroll: string
  /** 纵向可滚动 */
  rootScrollVertical: string
  /** 整组禁用 */
  rootDisabled: string
  /** 整组只读 */
  rootReadonly: string
  /** 单个 Tab 按钮基础样式 */
  tab: string
  /** 横向 Tab 默认高度与内边距 */
  tabHorizontal: string
  /** 纵向 Tab */
  tabVertical: string
  /** Tab 等分宽度 */
  tabEqualWidth: string
  /** Tab 自适应宽度 */
  tabAdaptive: string
  /** Tab 激活状态 */
  tabActive: string
  /** Tab 禁用状态 */
  tabDisabled: string
  /** Tab 只读（可聚焦不可切换） */
  tabReadonly: string
  /** Tab 聚焦样式 */
  tabFocused: string
  /** Tab 内容包裹（含 Badge） */
  tabContent: string
  /** Tab 文本基础样式 */
  tabText: string
  /** Tab 文本未激活状态 */
  tabTextInactive: string
  /** Tab 文本激活状态 */
  tabTextActive: string
  /** 指示条基础 */
  indicator: string
  /** 横向、指示条在末端（通常为底） */
  indicatorHorizontalEnd: string
  /** 横向、指示条在起始（通常为顶） */
  indicatorHorizontalStart: string
  /** 纵向、指示条在末端（通常为右） */
  indicatorVerticalEnd: string
  /** 纵向、指示条在起始（通常为左） */
  indicatorVerticalStart: string
  /** 指示条整组禁用色 */
  indicatorDisabled: string
  /** 指示条只读色 */
  indicatorReadonly: string
  /** 指示条完成首次布局后可附加的类 */
  indicatorReady: string
  /** 指示条位置过渡 */
  indicatorMotion: string
  /** 无过渡 */
  indicatorNoMotion: string
  /** 尺寸：小 */
  sizeSmall: string
  /** 尺寸：中（横向时与 `tabHorizontal` 搭配） */
  sizeMedium: string
  /** 尺寸：大 */
  sizeLarge: string
}

export interface CwTabsStripTexts {
  /** 标签列表无障碍名称 */
  tablistLabel?: string
}

export interface CwTabsStripProps {
  /** Tab 列表 */
  items: CwTabsStripItem[]
  /** 当前激活索引（`v-model:activeIndex`） */
  activeIndex?: number
  /**
   * 当前选中项的值（`v-model:modelValue`），与 `items[].value` / `items[].key` 对应。
   * 绑定时会与 `activeIndex` 双向同步。
   */
  modelValue?: CwTabsStripValue
  /** 是否等分宽度（仅横向有效） */
  equalWidth?: boolean
  /** 第一项去掉左侧内边距 */
  tabFlushStart?: boolean
  /** 最后一项去掉右侧内边距 */
  tabFlushEnd?: boolean
  /** 横向 | 纵向 */
  orientation?: 'horizontal' | 'vertical'
  /**
   * 指示条位置：横向时 `start`=顶、`end`=底；纵向时 `start`=左、`end`=右
   */
  indicatorPlacement?: 'start' | 'end'
  /** 禁用整组 */
  disabled?: boolean
  /** 只读：可聚焦，点击不切换 */
  readonly?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 自定义样式 */
  styles?: Partial<CwTabsStripStyles>
  /** 自定义文案 */
  texts?: Partial<CwTabsStripTexts>
}

export interface CwTabsStripEmits {
  (e: 'update:activeIndex', index: number): void
  (e: 'update:modelValue', value: CwTabsStripValue | undefined): void
  (e: 'change', index: number, value: CwTabsStripValue | undefined, item: CwTabsStripItem): void
}

export function resolveTabsStripItemValue(item: CwTabsStripItem): CwTabsStripValue | undefined {
  if (item.value !== undefined && item.value !== null) return item.value
  if (item.key !== undefined && item.key !== null) return item.key
  return undefined
}

/** 将 `count` / `mark` 转为 Badge 配置（与原先 CwTabsBar 行为一致） */
export function tabsStripItemToBadge(item: CwTabsStripItem): Partial<CwBadgeProps> | undefined {
  if (item.badge && Object.keys(item.badge).length > 0) {
    return item.badge
  }
  if (item.count != null && Number(item.count) > 0) {
    return { content: item.count, max: 99 }
  }
  if (typeof item.mark === 'number' && item.mark > 0) {
    return { content: item.mark, max: 99 }
  }
  if (item.mark === true) {
    return { dot: true }
  }
  return undefined
}
