import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

import type { CwFeatureCardGridAppearance, CwFeatureCardGridTexts } from '@zengchaowu/ui-shared/components/CwFeatureCardGrid/types'
export type { CwFeatureCardGridAppearance }

export interface CwFeatureCardItem {
  /** 唯一键值 */
  key: string
  /** 标题文案（必填） */
  label: string
  /** 副标题 / 描述文案（可选） */
  description?: string
  /**
   * iconfont 名称（传给 CwIcon.name）
   * - 例如：'common--action--download-line'、'PDF'
   * - 会与 image 二选一优先级：image > icon
   */
  icon?: string
  /**
   * 图片地址（URL 或 base64）
   * - 如果存在，则优先使用图片作为图标展示
   */
  image?: string
  /** 图标容器背景色（单个 item 可配置） */
  iconBgColor?: string
  /** 图标颜色（单个 item 可配置，仅对 iconfont 有效） */
  iconColor?: string
  /** 是否禁用 */
  disabled?: boolean
  /**
   * 单个卡片点击回调
   * - 如果存在，则优先调用
   */
  onClick?: (item: CwFeatureCardItem, event: ReactMouseEvent<HTMLDivElement>) => void
}

export interface CwFeatureCardGridProps {
  /** 功能卡片列表（点击行为通过 items[].onClick 配置） */
  items?: CwFeatureCardItem[]
  /** 标题文案（例如“订单”），不传则不渲染头部 */
  title?: string
  /** 最大展示数量（超出部分会被截断） */
  maxItems?: number
  /**
   * 布局方式：
   * - 'fixed'：固定列数，使用 CSS Grid
   * - 'auto'：自适应等分，使用 flex-grow
   */
  layout?: 'fixed' | 'auto'
  /** 固定列数（layout = 'fixed' 时生效，默认 5） */
  columns?: number
  /** 场景外观：`home` 为较大图标、多行描述的宫格 */
  appearance?: CwFeatureCardGridAppearance
  texts?: Partial<CwFeatureCardGridTexts>
  /** Vue `#icon` 作用域插槽 */
  iconSlot?: ReactNode | ((scope: { item: CwFeatureCardItem }) => ReactNode)
}
