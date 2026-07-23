import type { CwGridStyles } from '../CwGrid/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

/** 功能项数据 */
export interface CwFunctionGridItem {
  /** 功能键值 */
  key: string
  /** 图标 SVG 字符串 */
  icon?: string
  /** 功能名称 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 点击回调函数 */
  onClick?: (item: CwFunctionGridItem, event: MouseEvent) => void
}

export interface CwFunctionGridStyles {
  /** 根容器基础样式 */
  root: string
  /** 标题栏容器 */
  header: string
  /** 标题左侧区域（包含竖条和文字） */
  titleContainer: string
  /** 标题左侧竖条 */
  titleBar: string
  /** 标题文字 */
  title: string
  /** 全部门店链接 */
  allStoresLink: string
  /** 全部门店链接正常状态 */
  allStoresLinkNormal: string
  /** 全部门店链接键盘聚焦 */
  allStoresLinkFocused: string
  /** CwGrid 样式配置 */
  gridStyles?: Partial<CwGridStyles>
  /** 功能项根容器基础样式 */
  functionItemRoot: string
  functionItemRootNormal: string
  functionItemRootDisabled: string
  functionItemRootFocused: string
  /** 功能项内容区域 */
  functionItemContent: string
  /** 功能项图标容器 */
  functionItemIconContainer: string
  functionItemIconContainerNormal: string
  functionItemIconContainerDisabled: string
  /** 功能项文字标签 */
  functionItemLabel: string
  functionItemLabelNormal: string
  functionItemLabelDisabled: string
  /** CwIcon 样式配置 */
  functionItemIconStyles?: CwIconEmbed
  /** CwIcon 样式配置（全部门店链接箭头图标） */
  arrowIconStyles?: CwIconEmbed
}

export interface CwFunctionGridTexts {
  /** 标题文字 */
  title: string
  /** 全部门店链接文字 */
  allStores: string
}

export interface CwFunctionGridProps {
  /** 功能项列表 */
  items: CwFunctionGridItem[]
  /** 每行列数（默认 4） */
  columns?: number
  /** 是否显示全部门店链接 */
  showAllStoresLink?: boolean
  /** 全部门店链接点击回调函数 */
  onAllStoresClick?: (event: MouseEvent) => void
  /** 自定义样式对象 */
  styles?: Partial<CwFunctionGridStyles>
  /** 自定义文本对象 */
  texts?: Partial<CwFunctionGridTexts>
}

export interface CwFunctionGridEmits {
  /** 点击全部门店链接 */
  allStoresClick: [event: MouseEvent]
}

