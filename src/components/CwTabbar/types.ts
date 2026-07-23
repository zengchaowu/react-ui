import type { Placement } from '@zengchaowu/shared/types/placement'
import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwTabbarItem {
  /**
   * 唯一标识
   */
  key: string
  /**
   * 显示文本
   */
  label: string
  /**
   * 图标的 SVG 字符串
   */
  icon: string
  /**
   * 角标内容
   */
  badge?: string | number
  /**
   * 自定义无障碍标签
   */
  ariaLabel?: string
  /**
   * 角标自定义无障碍描述
   */
  badgeLabel?: string
  /**
   * 是否禁用该项
   */
  disabled?: boolean
  /**
   * 为 true 时不展示底部文案（仍可用 ariaLabel 做无障碍说明）
   */
  hideLabel?: boolean
  /**
   * 原生 `title`，悬停提示（窄侧栏仅图标时常用）
   */
  title?: string
  /**
   * `CwTooltip` 文案；与 `hideLabel` 搭配时用于侧栏等场景
   */
  tooltip?: string
}

export interface CwTabbarProps {
  /**
   * 场景外观（禁止业务侧 `styles` 覆盖）
   */
  appearance?: CwTabbarAppearance
  /**
   * 尺寸：`md` 为默认，`lg` 放大图标与点击区域
   */
  size?: 'md' | 'lg'
  /**
   * 项上有 `tooltip` 时的弹出位置；未传时纵向默认 `right`，横向默认 `top`
   */
  tooltipPlacement?: Placement
  /**
   * 项上 `tooltip` 的 hover 显示延迟（毫秒），与 `CwTooltip.showDelay` 一致
   * @default 120
   */
  tooltipShowDelay?: number
  /**
   * 项上 `tooltip` 与锚点的间距（像素），与 `CwTooltip.offset` 一致。
   * 未传时纵向默认 20，横向默认 8。
   */
  tooltipOffset?: number
  /**
   * 项上 tooltip 是否允许主轴翻转（right↔left 等）。
   * 未传时纵向侧栏为 false（避免翻回左侧与 Tab 重叠），横向为 true。
   */
  tooltipFlip?: boolean
  /**
   * 触屏侧栏等：长按 (~450ms) 显示 tooltip（manual），短按仍切换 Tab。
   * 避免 touch + hover 与 1s showDelay 下轻点先跳转、提示来不及出现。
   */
  tooltipTouchLongPress?: boolean
  /**
   * 外沿分隔：横向为容器顶部 hairline；纵向为右侧 `border-r`（与主内容区一侧对齐）。
   * 纵向时根节点仍会隐藏 `::before` 顶线伪元素。
   */
  showTopDivider?: boolean
  /**
   * 排列方向：横向为底部导航，纵向为侧栏导航
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * 当前选中的项
   */
  modelValue?: string
  /**
   * Tabbar 项配置
   */
  items?: CwTabbarItem[]
  /**
   * 是否禁用整个组件
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readonly?: boolean
  /**
   * 为 true 时：若 `modelValue` 不在当前 `items` 中，不自动回退到首项、不向外 emit（用于侧栏与底部入口拆分等场景）。
   */
  preserveModelWhenMissing?: boolean
  /**
   * 横向底栏项过多时启用 CwDiv 横向滚动；纵向侧栏不受影响。
   * @default true
   */
  itemsScrollable?: boolean
  /**
   * 横向滚动时是否隐藏 CwDiv 自定义滚动条（仍可滑动/拖拽滚动）。
   * @default true
   */
  itemsScrollHideScrollbar?: boolean
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwTabbarTexts>
}

export type CwTabbarAppearance = 'default' | 'chatShell' | 'chatShellMobile'

export interface CwTabbarStyles {
  /** 根容器基础样式 */
  root: string
  /** 根容器正常状态 */
  rootNormal: string
  /** 根容器禁用状态 */
  rootDisabled: string
  /** 根容器只读状态 */
  rootReadonly: string
  /** 项容器包裹样式 */
  items: string
  /** 横向底栏项过多、启用 CwDiv 横向滚动时的 items 追加样式 */
  itemsHorizontalScroll?: string
  /** 单个项基础样式 */
  item: string
  /** 单个项正常状态 */
  itemNormal: string
  /** 单个项选中状态 */
  itemActive: string
  /** 单个项禁用状态 */
  itemDisabled: string
  /** 单个项只读状态 */
  itemReadonly: string
  /** 单个项聚焦状态 */
  itemFocused: string
  /** 单个项内容容器基础样式 */
  itemContent: string
  /** 图标容器基础样式 */
  itemIconWrapper: string
  /** 标签文本基础样式 */
  itemLabel: string
  /** 标签文本正常状态 */
  itemLabelNormal: string
  /** 标签文本选中状态 */
  itemLabelActive: string
  /** 标签文本禁用状态 */
  itemLabelDisabled: string
  /** 标签文本只读状态 */
  itemLabelReadonly: string
  /** 角标基础样式 */
  badge: string
  /** 角标正常状态 */
  badgeNormal: string
  /** 角标禁用状态 */
  badgeDisabled: string
  /** 角标只读状态 */
  badgeReadonly: string
  /** 图标样式配置 */
  itemIconStyles?: CwIconEmbed
}

export interface CwTabbarTexts {
  /**
   * Tabbar 根元素的无障碍标签
   */
  tabbarLabel?: string
  /**
   * 角标的无障碍标签前缀
   */
  badgeLabel?: string
}

export interface CwTabbarEmits {
  /**
   * 更新 v-model
   */
  'update:modelValue': [value: string]
  /**
   * 选中项变更时触发
   */
  change: [value: string, item: CwTabbarItem]
}

