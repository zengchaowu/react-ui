import type { CwCardTexts } from '../CwCard/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwFeatureCardItem {
  /** 唯一键值 */
  key: string
  /** 标题文案（必填） */
  label: string
  /** 副标题 / 描述文案（可选） */
  description?: string
  /**
   * iconfont 名称（传给 CwIcon.name）
   * - 例如：'common--action--xiazai'、'PDF'
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
  onClick?: (item: CwFeatureCardItem, event: MouseEvent) => void
}

export interface CwFeatureCardGridStyles {
  /** 根容器样式 */
  root: string
  /** 头部容器 */
  header: string
  /** 标题文字样式 */
  title: string
  /** 固定列数布局下的网格容器样式 */
  gridFixed: string
  /** 自动铺满布局下的容器样式（flex-wrap） */
  gridAuto: string
  /** 卡片根节点样式 */
  item: string
  /** 禁用态样式 */
  itemDisabled: string
  /** 图标容器样式 */
  iconBox: string
  /** 标题文本样式 */
  label: string
  /** 描述文本样式 */
  description: string
  /** 图标样式（传给 CwIcon.styles） */
  iconStyles?: CwIconEmbed
}

export interface CwFeatureCardGridTexts {
  cardTexts?: Partial<CwCardTexts>
}

export interface CwFeatureCardGridProps {
  /** 功能卡片列表（点击行为通过 items[].onClick 配置） */
  items: CwFeatureCardItem[]
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
  /** 自定义样式 */
  styles?: Partial<CwFeatureCardGridStyles>
  texts?: Partial<CwFeatureCardGridTexts>
}

