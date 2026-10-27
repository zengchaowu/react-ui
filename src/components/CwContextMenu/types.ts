import type { Placement } from '@zengchaowu/shared/types/placement'
import type { CwContextMenuAppearance } from '@zengchaowu/ui-shared/components/CwContextMenu/types'

export type CwContextMenuLayout = 'list' | 'toolbar'

export interface CwContextMenuItem {
  /** `select` 事件载荷，需唯一 */
  key: string
  label: string
  /**
   * 可选：iconfont 图标名（与 `CwIcon` 的 `name` 一致，如 `common--action--copy-line`）
   */
  icon?: string
  /** 与 `CwIcon.prefix` 一致，默认 `icon` */
  iconPrefix?: string
  /**
   * 与 `CwIcon.mode` 一致；`windows--*` 等多色图标须用 `symbol`（字体字形为空）
   * @default 'font'
   */
  iconMode?: 'font' | 'symbol'
  /** 右侧快捷键文案（如 `R`、`Shift L`）；`toolRail` 外观下单独一列展示 */
  shortcut?: string
  disabled?: boolean
  /** 警示样式（如删除） */
  danger?: boolean
  /** 当前选中项；`toolRail` 下左侧勾选 + 中性底，其它外观仍为高亮底 */
  selected?: boolean
  /** 在该项之后渲染细分隔线 */
  dividerAfter?: boolean
  /** 子菜单；有值时右侧显示 `>`，悬停/点击侧向展开（主菜单保持打开） */
  children?: CwContextMenuItem[]
}

/** 菜单相对锚点矩形定位时的矩形（与 DOMRect 对应字段一致） */
export type CwContextMenuAnchorRect = Pick<
  DOMRect,
  'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'
>

/**
 * 右键菜单宿主组件 Props（由 Vue `CwContextMenuEphemeral` 的 defineProps 转换）。
 */
export interface CwContextMenuProps {
  x: number
  y: number
  items?: CwContextMenuItem[]
  placement?: Placement
  /** 列表竖排（默认）或移动端消息工具条横排 */
  layout?: CwContextMenuLayout
  /** 传入时菜单相对该矩形定位（如消息气泡），优先于 x/y 点定位 */
  anchorRect?: CwContextMenuAnchorRect | null
  viewportPadding?: number
  /** 菜单与 anchorRect 间距（px） */
  anchorOffset?: number
  shadow?: boolean
  closeOnSelect?: boolean
  appearance?: CwContextMenuAppearance
  /** 相对锚点显示小三角（需配合 anchorRect） */
  showArrow?: boolean
  /** 为 false 时不主轴翻转，保持显式 placement（如下拉在锚点下方） */
  flip?: boolean
  panelClass?: string
  onSelect?: (key: string, item: CwContextMenuItem) => void
  /** 菜单请求关闭（点击外部 / Esc / 选中项后） */
  onRequestClose: () => void
}

export interface CwContextMenuEmits {
  (e: 'select', key: string, item: CwContextMenuItem): void
  (e: 'open', payload: { clientX: number; clientY: number }): void
  (e: 'close'): void
  (e: 'update:visible', visible: boolean): void
}

/** 命令式宿主暴露的句柄 */
export interface CwContextMenuHandle {
  close: () => void
}
