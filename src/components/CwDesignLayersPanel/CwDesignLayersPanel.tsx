import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwInput from '../CwInput/CwInput'
import type { CwInputHandle } from '../CwInput/types'
import CwTree from '../CwTree/CwTree'
import type { CwTreeNode } from '../CwTree/types'
import type { CwDesignLayersPanelProps } from './types'
import {
  designLayersPanelBase,
  designLayersPanelEmbeddedPatch,
} from './styles'
import { defaultCwDesignLayersPanelTexts } from './texts'
import { filterDesignLayerTree } from './filterDesignLayerTree'

function collectExpandableKeys(nodes: CwTreeNode[]): (string | number)[] {
  const keys: (string | number)[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      keys.push(node.key)
      keys.push(...collectExpandableKeys(node.children))
    }
  }
  return keys
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

function layerTreeContainsKey(node: CwTreeNode, key: string | number): boolean {
  if (node.key === key) return true
  return (node.children ?? []).some((child) => layerTreeContainsKey(child, key))
}

export function CwDesignLayersPanel({
  data = [],
  selectedKeys,
  selectable = true,
  searchable = true,
  renameable = true,
  reorderable = true,
  layerActions = true,
  searchPlaceholder,
  defaultExpandAll = true,
  layout = 'default',
  texts: textsProp,
  extraSlot,
  className,
  onSelectedKeysChange,
  onSearchChange,
  onRename,
  onToggleVisible,
  onToggleLocked,
  onReorder,
  onNodeContextmenu,
}: CwDesignLayersPanelProps) {
  const panelBase = useMemo(
    () =>
      layout === 'embedded'
        ? { ...designLayersPanelBase, ...designLayersPanelEmbeddedPatch }
        : designLayersPanelBase,
    [layout],
  )

  const texts = useMemo(
    () => ({ ...defaultCwDesignLayersPanelTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [editingKey, setEditingKey] = useState<string | number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const renameInputRef = useRef<CwInputHandle | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([])
  /** 用户是否已手动切换过全部展开/折叠（避免数据刷新时强行重置） */
  const [expandPreference, setExpandPreference] = useState<
    'all' | 'none' | null
  >(null)
  const prevExpandableKeysRef = useRef<Set<string | number>>(new Set())

  const searchPlaceholderText = searchPlaceholder ?? texts.searchPlaceholder

  const selectedKeysSafe = selectedKeys ?? []

  const filteredData = useMemo(
    () => filterDesignLayerTree(data ?? [], searchQuery),
    [data, searchQuery],
  )

  const expandableKeys = useMemo(
    () => collectExpandableKeys(filteredData),
    [filteredData],
  )

  const allExpanded = useMemo(() => {
    const keys = expandableKeys
    if (!keys.length) return false
    const set = new Set(expandedKeys)
    return keys.every((key) => set.has(key))
  }, [expandableKeys, expandedKeys])

  const expandToggleTitle = useMemo(() => {
    const action = allExpanded ? texts.collapseAllGroups : texts.expandAllGroups
    return `${action} Alt+L`
  }, [allExpanded, texts])

  function onExpandedKeysUpdate(keys: (string | number)[]) {
    setExpandedKeys(keys)
    setExpandPreference(null)
  }

  // 等价 Vue watch(filteredData, sync, { immediate: true })
  useEffect(() => {
    setExpandedKeys((prevKeys) => {
      const keys = expandableKeys
      const keySet = new Set(keys)
      if (!keys.length) {
        prevExpandableKeysRef.current = keySet
        return prevKeys.length ? [] : prevKeys
      }
      if (expandPreference === 'all') {
        prevExpandableKeysRef.current = keySet
        return keys
      }
      if (expandPreference === 'none') {
        prevExpandableKeysRef.current = keySet
        return prevKeys.length ? [] : prevKeys
      }
      if (prevKeys.length === 0 && defaultExpandAll) {
        prevExpandableKeysRef.current = keySet
        return keys
      }
      const next = prevKeys.filter((key) => keySet.has(key))
      // 仅自动展开「新增」的分组，不恢复用户已折叠的节点
      if (defaultExpandAll) {
        for (const key of keys) {
          if (!prevExpandableKeysRef.current.has(key) && !next.includes(key)) {
            next.push(key)
          }
        }
      }
      prevExpandableKeysRef.current = keySet
      return next
    })
  }, [expandableKeys, expandPreference, defaultExpandAll])

  const toggleExpandAll = useCallback(() => {
    if (!expandableKeys.length) return
    if (allExpanded) {
      setExpandedKeys([])
      setExpandPreference('none')
    } else {
      setExpandedKeys([...expandableKeys])
      setExpandPreference('all')
    }
  }, [expandableKeys, allExpanded])

  const toggleExpandAllRef = useRef(toggleExpandAll)
  toggleExpandAllRef.current = toggleExpandAll

  useEffect(() => {
    function onWindowKeydown(event: KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key !== 'l' && event.key !== 'L') return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      toggleExpandAllRef.current()
    }
    window.addEventListener('keydown', onWindowKeydown)
    return () => {
      window.removeEventListener('keydown', onWindowKeydown)
    }
  }, [])

  function onSearchInput(value: string) {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  function startRename(node: CwTreeNode) {
    if (!renameable) return
    setEditingKey(node.key)
    setEditingValue(node.label)
  }

  // 等价 Vue nextTick 后聚焦重命名输入框
  useLayoutEffect(() => {
    if (editingKey == null) return
    renameInputRef.current?.focus()
  }, [editingKey])

  const cancelRename = useCallback(() => {
    setEditingKey(null)
    setEditingValue('')
  }, [])

  function commitRename(key: string | number) {
    if (editingKey !== key) return
    const next = editingValue.trim()
    setEditingKey(null)
    setEditingValue('')
    onRename?.(key, next)
  }

  // 等价 Vue watch(props.data)：重命名目标被删除时取消编辑
  useEffect(() => {
    if (editingKey == null) return
    const stillExists = (data ?? []).some((node) =>
      layerTreeContainsKey(node, editingKey),
    )
    if (!stillExists) cancelRename()
  }, [data, editingKey, cancelRename])

  function onRenameInputKeyDown(event: KeyboardEvent, nodeKey: string | number) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitRename(nodeKey)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelRename()
    }
  }

  function onRowActionClick(
    event: ReactMouseEvent<HTMLElement>,
    handler: ((key: string | number) => void) | undefined,
    key: string | number,
  ) {
    event.stopPropagation()
    handler?.(key)
  }

  const renderDefaultExtra = (node: CwTreeNode) =>
    layerActions ? (
      <span className={panelBase.rowActions}>
        <button
          type="button"
          className={[
            panelBase.rowAction,
            node.layerLocked ? panelBase.rowActionActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          title={node.layerLocked ? texts.unlockLayer : texts.lockLayer}
          aria-label={node.layerLocked ? texts.unlockLayer : texts.lockLayer}
          disabled={!selectable}
          onClick={(event) => onRowActionClick(event, onToggleLocked, node.key)}
        >
          <CwIcon
            name={
              node.layerLocked
                ? 'common--action--lock-line'
                : 'common--action--unlock-line'
            }
            prefix="icon"
            size={0.875}
          />
        </button>
        <button
          type="button"
          className={[
            panelBase.rowAction,
            node.layerVisible === false ? panelBase.rowActionActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          title={
            node.layerVisible === false ? texts.showLayer : texts.hideLayer
          }
          aria-label={
            node.layerVisible === false ? texts.showLayer : texts.hideLayer
          }
          disabled={!selectable}
          onClick={(event) =>
            onRowActionClick(event, onToggleVisible, node.key)
          }
        >
          <CwIcon
            name={
              node.layerVisible === false
                ? 'common--action--eye-off-line'
                : 'common--action--eye-line'
            }
            prefix="icon"
            mode="symbol"
            size={0.875}
          />
        </button>
      </span>
    ) : node.sizeLabel ? (
      <span
        className="tabular-nums [font-size:var(--font-size-xs)] text-[var(--text-color-secondary)]"
        title="包围盒宽高（画布坐标，含缩放与旋转）"
      >
        {String(node.sizeLabel)}
      </span>
    ) : null

  return (
    <aside
      className={[panelBase.root, className].filter(Boolean).join(' ')}
      aria-label="图层"
    >
      <div className={panelBase.header}>
        <span className={panelBase.headerTitle}>{texts.title}</span>
        <div className={panelBase.headerActions}>
          <button
            type="button"
            className={panelBase.expandToggle}
            title={expandToggleTitle}
            aria-label={expandToggleTitle}
            disabled={!expandableKeys.length}
            onClick={toggleExpandAll}
          >
            <CwIcon name="common--action--arrange-line" prefix="icon" size={0.875} />
          </button>
        </div>
      </div>

      {searchable && (
        <div className={panelBase.search}>
          <CwInput
            value={searchQuery}
            size="small"
            clearable
            placeholder={searchPlaceholderText}
            onChange={onSearchInput}
            iconSlot={
              <CwIcon
                name="common--action--search-line"
                prefix="icon"
                size={0.875}
              />
            }
          />
        </div>
      )}

      <div className={panelBase.treeWrap}>
        {filteredData.length ? (
          <CwTree
            data={filteredData}
            selectedKeys={selectedKeysSafe}
            expandedKeys={expandedKeys}
            selectable={selectable}
            reorderable={reorderable && !searchQuery.trim()}
            defaultExpandAll={false}
            multiple={true}
            size="small"
            showLine={false}
            showIcon={true}
            onUpdateSelectedKeys={onSelectedKeysChange}
            onUpdateExpandedKeys={onExpandedKeysUpdate}
            onNodeReorder={onReorder}
            onNodeContextmenu={onNodeContextmenu}
            iconSlot={({ node }) =>
              typeof node.thumbnailUrl === 'string' && node.thumbnailUrl ? (
                <img
                  src={node.thumbnailUrl}
                  alt=""
                  className="h-4 w-4 rounded-sm object-contain bg-[var(--bg-color-secondarycontainer)]"
                  draggable={false}
                />
              ) : (
                <span
                  className="inline-block h-4 w-4 rounded-sm bg-[var(--bg-color-secondarycontainer)]"
                  aria-hidden="true"
                />
              )
            }
            labelSlot={({ node }) =>
              renameable && editingKey === node.key ? (
                <CwInput
                  ref={renameInputRef}
                  value={editingValue}
                  size="small"
                  showLabel={false}
                  placeholder={texts.renamePlaceholder}
                  className="w-full"
                  onChange={setEditingValue}
                  onKeyDown={(event) => onRenameInputKeyDown(event, node.key)}
                  onBlur={() => commitRename(node.key)}
                  onClick={(event) => event.stopPropagation()}
                />
              ) : (
                <span
                  className={[
                    panelBase.labelText,
                    node.layerVisible === false ? panelBase.labelTextHidden : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={
                    renameable ? `${node.label}（双击重命名）` : node.label
                  }
                  onDoubleClick={(event) => {
                    event.stopPropagation()
                    startRename(node)
                  }}
                >
                  {node.label}
                </span>
              )
            }
            extraSlot={({ node }) =>
              extraSlot ? extraSlot({ node }) : renderDefaultExtra(node)
            }
          />
        ) : (
          <div className={panelBase.empty}>
            {searchQuery.trim() ? texts.emptySearch : texts.emptyLayers}
          </div>
        )}
      </div>
    </aside>
  )
}

export default CwDesignLayersPanel
