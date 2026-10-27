import type { HTMLAttributes, ReactNode } from 'react'
import type { CwChromeTabItem, CwChromeTabAppearance, CwChromeTabTexts } from '@zengchaowu/ui-shared/components/CwChromeTab/types'

/** `tab-icon` 作用域插槽参数 */
export interface CwChromeTabIconScope {
  tab: CwChromeTabItem
  index: number
}

export interface CwChromeTabProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'className' | 'children' | 'contextMenu' | 'onChange' | 'onClose' | 'onSelect'
  > {
  /** 标签列表 */
  tabs: CwChromeTabItem[]
  /** 当前激活的标签 id（对应 `v-model:activeId`） */
  activeId?: string | number | null
  /** 是否可关闭标签 */
  closable?: boolean
  /** 是否显示添加标签按钮 */
  addable?: boolean
  /**
   * 外观变体：
   * - `default`：通用 Chrome 标签栏
   * - `tab-strip`：IDE 编辑区 / 对话标签条
   */
  appearance?: CwChromeTabAppearance
  /** 自定义文案 */
  texts?: Partial<CwChromeTabTexts>
  /** 是否启用标签右键菜单（关闭 / 关闭其他 / 关闭右侧 / 关闭全部），默认开启 */
  contextMenu?: boolean
  /** 标签顶部是否圆角，可传入圆角大小，如 'md' 'lg' 'xl' '2xl'，默认 ''（无圆角） */
  topRounded?: string
  /** `tab-icon` 作用域插槽 */
  tabIconSlot?: (scope: CwChromeTabIconScope) => ReactNode
  className?: string
  /** 对应 `update:activeId` */
  onActiveIdChange?: (id: string | number | null) => void
  /** 对应 `close` */
  onClose?: (id: string | number, index: number) => void
  /** 对应 `close-others` */
  onCloseOthers?: (keepId: string | number, ids: Array<string | number>) => void
  /** 对应 `close-to-the-right` */
  onCloseToTheRight?: (id: string | number, ids: Array<string | number>) => void
  /** 对应 `close-all` */
  onCloseAll?: (ids: Array<string | number>) => void
  /** 对应 `add` */
  onAdd?: () => void
  /** 对应 `change` */
  onChange?: (
    id: string | number | null,
    index: number,
    tab: CwChromeTabItem | null,
  ) => void
  /** 对应 `reorder` */
  onReorder?: (
    tabs: CwChromeTabItem[],
    draggedId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void
}

export interface CwChromeTabEmits {
  onActiveIdChange?: (id: string | number | null) => void
  onClose?: (id: string | number, index: number) => void
  onCloseOthers?: (keepId: string | number, ids: Array<string | number>) => void
  onCloseToTheRight?: (id: string | number, ids: Array<string | number>) => void
  onCloseAll?: (ids: Array<string | number>) => void
  onAdd?: () => void
  onChange?: (
    id: string | number | null,
    index: number,
    tab: CwChromeTabItem | null,
  ) => void
  onReorder?: (
    tabs: CwChromeTabItem[],
    draggedId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void
}
