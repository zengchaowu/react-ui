import type {
  CwContextMenuItem,
  CwContextMenuProps,
  CwContextMenuEmits,
} from '../CwContextMenu/types'

export type { CwContextMenuItem, CwContextMenuEmits }

/**
 * 「包裹任意节点 + 右键弹出菜单」的通用壳层，内部使用 {@link CwContextMenu}。
 * 适用于消息行、列表单元、画布节点等需要统一右键交互的场景。
 */
export interface CwAttachContextMenuProps extends CwContextMenuProps {
  /**
   * 为 true 时不拦截右键、不展示菜单，仅透传默认插槽（布局与普通子树一致）。
   */
  disabled?: boolean
}
