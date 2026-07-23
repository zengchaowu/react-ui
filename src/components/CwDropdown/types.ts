import type { CwPopupStyles } from '../CwPopup/types'
import type { CwButtonType, CwButtonVariant } from '../CwButton/types'
import type { CwEmbeddedIconStyles } from '../CwIcon/types'

/** 下拉菜单项 */
export interface CwDropdownItem {
  /** 选项值，随 `select` 事件回传 */
  value: string | number
  /** 展示文案 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
}

export interface CwDropdownStyles {
  root: string
  triggerWrap: string
  /** 触发按钮内层（图标 + 文案 + 箭头）布局 */
  triggerInner: string
  menu: string
  menuItem: string
  menuItemNormal: string
  menuItemDisabled: string
  menuItemHover: string
  menuItemActive: string
  /** 小尺寸菜单项 */
  sizeSmall: string
  /** 中尺寸菜单项 */
  sizeMedium: string
  /** 大尺寸菜单项 */
  sizeLarge: string
  arrowOpen: string
  arrowIconStyles: CwEmbeddedIconStyles
  /** 触发区左侧图标（与 triggerLeadingIcon 配套） */
  leadingIconStyles: CwEmbeddedIconStyles
  /** 透传给 CwPopup */
  popupStyles: Partial<CwPopupStyles>
}

export interface CwDropdownTexts {
  /** 触发按钮文案 */
  triggerLabel: string
  /** 无选项时的菜单提示 */
  empty: string
}

export interface CwDropdownProps {
  /** 菜单项 */
  items: CwDropdownItem[]
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
  styles?: Partial<CwDropdownStyles>
  texts?: Partial<CwDropdownTexts>
}

export interface CwDropdownEmits {
  (e: 'visibleChange', value: boolean): void
  (e: 'select', value: string | number, item: CwDropdownItem): void
}
