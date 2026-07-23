/** 面包屑单项 */
export interface CwBreadcrumbItem {
  /** 显示文本 */
  label: string
  /** 路由路径（与 href 二选一，优先 to） */
  to?: string
  /** 外链地址 */
  href?: string
  /** 是否禁用点击 */
  disabled?: boolean
}

export type CwBreadcrumbAppearance = 'default' | 'toolbar'

export interface CwBreadcrumbProps {
  /** 面包屑项列表 */
  items: CwBreadcrumbItem[]
  /** 分隔符，默认 "/" */
  separator?: string
  /** 官方外观 */
  appearance?: CwBreadcrumbAppearance
  /** 自定义文本（如 aria） */
  texts?: Partial<CwBreadcrumbTexts>
}

export interface CwBreadcrumbTexts {
  /** 导航的 aria-label */
  ariaLabel?: string
}

export interface CwBreadcrumbEmits {
  /** 点击某一项时触发（to/href 由调用方处理时可监听此事件） */
  select: [item: CwBreadcrumbItem, index: number]
}
