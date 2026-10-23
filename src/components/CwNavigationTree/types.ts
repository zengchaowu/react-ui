import type { HTMLAttributes } from 'react'
import type { CwTreeNode } from '../CwTree/types'

export type { CwTreeNode }

/** 侧栏导航树场景外观 */
export type CwNavigationTreeAppearance = 'admin' | 'cloudDisk'

export interface CwNavigationTreeTexts {
  [key: string]: string | undefined
}

export interface CwNavigationTreeProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'children'
    | 'className'
    | 'onChange'
    | 'onClick'
    | 'onContextMenu'
    | 'onSelect'
    | 'draggable'
  > {
  /** 树形导航数据 */
  treeData?: CwTreeNode[]
  /** 受控的选中节点 key 数组 */
  selectedKeys?: (string | number)[]
  /** 受控的展开节点 key 数组 */
  expandedKeys?: (string | number)[]
  expandOnClickNode?: boolean
  highlightParentOnChildSelected?: boolean
  appearance?: CwNavigationTreeAppearance
  texts?: Partial<CwNavigationTreeTexts>
  className?: string
  /** 对应 `update:selectedKeys` */
  onUpdateSelectedKeys?: (keys: (string | number)[]) => void
  /** 对应 `update:expandedKeys` */
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
  /** 对应 `node-select` */
  onNodeSelect?: (
    keys: (string | number)[],
    info: { node: CwTreeNode; selected: boolean },
  ) => void
}

export interface CwNavigationTreeEmits {
  onUpdateSelectedKeys?: (keys: (string | number)[]) => void
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
  onNodeSelect?: (
    keys: (string | number)[],
    info: { node: CwTreeNode; selected: boolean },
  ) => void
}
