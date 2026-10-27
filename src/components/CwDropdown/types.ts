import type { ReactNode } from 'react'
import type { CwButtonType, CwButtonVariant } from '../CwButton/types'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwDropdownItem, CwDropdownAppearance, CwDropdownTexts } from '@zengchaowu/ui-shared/components/CwDropdown/types'

export interface CwDropdownStyles {
  root: string
  triggerWrap: string
  /** 触发按钮内层（图标 + 文案 + 箭头）布局 */
  triggerInner: string
  menu: string
  /** CwDiv content 等宽留白（壳无 padding，滚动条贴边） */
  menuContent?: string
  menuItem: string
  menuItemNormal: string
  menuItemDisabled: string
  /** 未选中项 hover（6%）；勿与 menuItemSelected 同挂 */
  menuItemHover: string
  /** 键盘游走高亮 */
  menuItemKeyboard: string
  /** 键盘焦点落在已选中项上 */
  menuItemKeyboardOnSelected: string
  /** 清单选中态菜单项 */
  menuItemSelected: string
  /** 勾选列占位 */
  menuItemCheck: string
  /** 菜单项左侧图标区 */
  menuItemIcon: string
  /** 菜单项文案 */
  menuItemLabel: string
  /** 小尺寸菜单项 */
  sizeSmall: string
  /** 中尺寸菜单项 */
  sizeMedium: string
  /** 大尺寸菜单项 */
  sizeLarge: string
  arrowOpen: string
  arrowIconStyles: CwIconEmbed
  /** 触发区左侧图标（与 triggerLeadingIcon 配套） */
  leadingIconStyles: CwIconEmbed
  /** 菜单项勾选图标 */
  checkIconStyles: CwIconEmbed
  /** 菜单项左侧图标 */
  itemIconStyles: CwIconEmbed
}

/** 自定义触发器作用域参数 */
export interface CwDropdownTriggerSlotScope {
  open: boolean
  toggle: () => void
  menuId: string
  disabled: boolean
}

export interface CwDropdownProps {
  /** 菜单项 */
  items?: CwDropdownItem[]
  /** 是否禁用触发器与菜单 */
  disabled?: boolean
  /** 触发按钮类型 */
  triggerType?: CwButtonType
  /** 触发按钮形态 */
  triggerVariant?: CwButtonVariant
  /** 触发按钮与菜单项尺寸 */
  size?: 'small' | 'medium' | 'large'
  /**
   * 触发区左侧图标（CwIcon `name`，对应 iconfont `font_class`）
   * 例如钉钉式「新建」左侧加号：`common--status--plus-line`
   */
  triggerLeadingIcon?: string
  /** 是否显示触发区右侧下拉箭头，默认 true */
  showTriggerCaret?: boolean
  /** 触发按钮是否占满父级宽度（侧栏通栏） */
  triggerFullWidth?: boolean
  /** 场景布局预设 */
  appearance?: CwDropdownAppearance
  /**
   * 为 true 时，`selected` 项左侧显示勾选列；默认 false（只变色）。
   */
  showSelectedCheck?: boolean
  /** CwPopup 浮层壳 class */
  popupClass?: string
  /** CwPopup trigger 包裹层 class */
  popupTriggerClass?: string
  texts?: Partial<CwDropdownTexts>
  /** 受控展开状态（对应 `v-model:open`） */
  open?: boolean
  /** 展开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 展开状态变化事件（对应 `visibleChange`） */
  onVisibleChange?: (visible: boolean) => void
  /** 选中项事件 */
  onSelect?: (value: string | number, item: CwDropdownItem) => void
  /** 具名插槽 trigger（作用域插槽，可传节点或函数） */
  triggerSlot?:
    | ReactNode
    | ((scope: CwDropdownTriggerSlotScope) => ReactNode)
  className?: string
}
