import type { HTMLAttributes, ReactNode } from 'react'
import type { CwBadgeOptions } from '../CwBadge/types'
import type { CwTabsStripValue, CwTabsStripAppearance, CwTabsStripTexts } from '@zengchaowu/ui-shared/components/CwTabsStrip/types'

/**
 * Tab 条：横向/纵向、滚动或等分、底部（或侧向）指示器，可选角标。
 */
export interface CwTabsStripItem {
  /** 显示文案 */
  label: string
  /** 唯一值，用于 `value` */
  value?: CwTabsStripValue
  /** 自定义无障碍标签 */
  ariaLabel?: string
  /** 是否禁用单项 */
  disabled?: boolean
  /** 透传 `CwBadge` */
  badge?: CwBadgeOptions
}

/** 自定义 Tab 内容（对应 Vue 作用域插槽 `tab`） */
export interface CwTabsStripTabScope {
  item: CwTabsStripItem
  index: number
  active: boolean
}

export interface CwTabsStripProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Tab 列表 */
  items?: CwTabsStripItem[]
  /** 当前激活索引（受控，对应 `v-model:activeIndex`） */
  activeIndex?: number
  /**
   * 当前选中项的值（对应 `v-model`），与 `items[].value` 对应；
   * 变化时会与 `activeIndex` 双向同步。
   */
  value?: CwTabsStripValue
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
  /** 场景外观 */
  appearance?: CwTabsStripAppearance
  /** 自定义文案 */
  texts?: Partial<CwTabsStripTexts>
  /** 具名作用域插槽 `tab`：自定义每个 Tab 的内容 */
  tabSlot?: (scope: CwTabsStripTabScope) => ReactNode
  /** 作用域插槽 `tab` 的 children 用法（`tabSlot` 优先） */
  children?: (scope: CwTabsStripTabScope) => ReactNode
  /** 激活索引变化（对应 `update:activeIndex`） */
  onActiveIndexChange?: (index: number) => void
  /** 选中项变化（对应 `update:modelValue` / `change`） */
  onChange?: (
    index: number,
    value: CwTabsStripValue | undefined,
    item: CwTabsStripItem,
  ) => void
}

export interface CwTabsStripEmits {
  onActiveIndexChange?: (index: number) => void
  onChange?: (
    index: number,
    value: CwTabsStripValue | undefined,
    item: CwTabsStripItem,
  ) => void
}

export function resolveTabsStripItemValue(
  item: CwTabsStripItem,
): CwTabsStripValue | undefined {
  if (item.value !== undefined && item.value !== null) return item.value
  return undefined
}

export function tabsStripItemToBadge(
  item: CwTabsStripItem,
): CwBadgeOptions | undefined {
  if (item.badge && Object.keys(item.badge).length > 0) {
    return item.badge
  }
  return undefined
}
