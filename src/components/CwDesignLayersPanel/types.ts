import type { CwTreeNode } from '../CwTree/types'

export interface CwDesignLayersPanelTexts {
  title: string
  sizeColumnLabel: string
  /** 当前已全部展开时的按钮提示 */
  collapseAllGroups: string
  /** 当前未全部展开时的按钮提示 */
  expandAllGroups: string
  lockLayer: string
  unlockLayer: string
  hideLayer: string
  showLayer: string
  searchPlaceholder: string
  emptySearch: string
  emptyLayers: string
  renamePlaceholder: string
}

export interface CwDesignLayersPanelStyles {
  root: string
  header: string
  headerTitle: string
  headerActions: string
  headerMeta: string
  expandToggle: string
  search: string
  treeWrap: string
  empty: string
  labelText: string
  labelTextHidden: string
  labelInput: string
  rowActions: string
  rowAction: string
  rowActionActive: string
}

export interface CwDesignLayersPanelProps {
  data?: CwTreeNode[]
  selectedKeys?: (string | number)[]
  selectable?: boolean
  searchable?: boolean
  /** 双击图层名进入重命名 */
  renameable?: boolean
  /** 是否允许拖拽调整同级图层顺序 */
  reorderable?: boolean
  /** 是否显示锁定 / 显示隐藏操作（默认 true） */
  layerActions?: boolean
  searchPlaceholder?: string
  defaultExpandAll?: boolean
  styles?: Partial<CwDesignLayersPanelStyles>
  texts?: Partial<CwDesignLayersPanelTexts>
}

export interface CwDesignLayersPanelEmits {
  'update:selectedKeys': [keys: (string | number)[]]
  'update:search': [query: string]
  rename: [key: string | number, name: string]
  'toggle-visible': [key: string | number]
  'toggle-locked': [key: string | number]
  reorder: [
    payload: {
      dragKey: string | number
      dropKey: string | number
      position: 'before' | 'after' | 'inside'
    },
  ]
}
