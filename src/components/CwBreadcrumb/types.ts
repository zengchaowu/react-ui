import type { CwBreadcrumbItem, CwBreadcrumbAppearance, CwBreadcrumbTexts } from '@zengchaowu/ui-shared/components/CwBreadcrumb/types'
﻿import type { HTMLAttributes } from 'react'

export interface CwBreadcrumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'> {
  /** 面包屑项列表 */
  items?: CwBreadcrumbItem[]
  /** 分隔符，默认 "/" */
  separator?: string
  /** 官方外观 */
  appearance?: CwBreadcrumbAppearance
  /** 自定义文本（如 aria） */
  texts?: Partial<CwBreadcrumbTexts>
  className?: string
  /** 点击某一项时触发（Vue `select`） */
  onSelect?: (item: CwBreadcrumbItem, index: number) => void
}

export interface CwBreadcrumbEmits {
  onSelect?: (item: CwBreadcrumbItem, index: number) => void
}
