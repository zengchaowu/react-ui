import type { MouseEvent as ReactMouseEvent } from 'react'

import type { CwFunctionGridTexts } from '@zengchaowu/ui-shared/components/CwFunctionGrid/types'

/** 功能项数据 */
export interface CwFunctionGridItem {
  /** 功能键值 */
  key: string
  /** iconfont 图标类名（font_class） */
  icon?: string
  /** 功能名称 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 点击回调函数 */
  onClick?: (item: CwFunctionGridItem, event: ReactMouseEvent<HTMLDivElement>) => void
}

export interface CwFunctionGridProps {
  /** 功能项列表 */
  items?: CwFunctionGridItem[]
  /** 每行列数（默认 4） */
  columns?: number
  /** 是否显示全部门店链接 */
  showAllStoresLink?: boolean
  /** 全部门店链接点击回调函数 */
  onAllStoresClick?: (event: ReactMouseEvent<HTMLDivElement>) => void
  /** 自定义文本对象 */
  texts?: Partial<CwFunctionGridTexts>
}

export interface CwFunctionGridEmits {
  /** 点击全部门店链接 */
  onAllStoresClick?: (event: ReactMouseEvent<HTMLDivElement>) => void
}
