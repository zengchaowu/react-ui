import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  UIEvent as ReactUIEvent,
} from 'react'
import type {
  CwTreeCheckInfo,
  CwTreeExpandInfo,
  CwTreeInteractionEvent,
  CwTreeNode as CwTreeNodeData,
  CwTreeProps,
  CwTreeReorderPayload,
  CwTreeSelectInfo,
  CwTreeTexts,
} from './types'
import { defaultTexts } from './texts'
import { resolveCwTreeStyles } from './resolveCwTreeStyles'
import { useCwTreeStylesOverride } from './cwTreeStylesOverride'
import CwTreeNodeComponent from './CwTreeNode'
import CwDiv, { type CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import {
  CW_TREE_LAZY_CONTEXT,
  type CwTreeLazyContext,
} from './cwTreeLazyContext'
import {
  CW_TREE_REORDER_CONTEXT,
  type CwTreeReorderContext,
  type CwTreeReorderDropTarget,
} from './cwTreeReorderContext'
import {
  collectVisibleSelectableKeys,
  resolveTreeMultiSelectKeys,
} from './cwTreeSelection.pure'
import {
  flattenVisibleTreeRows,
  treeVirtualRowHeight,
} from './functions/flattenVisibleTreeRows'
import { useTreeVirtualScroll } from './hooks/useTreeVirtualScroll'

const EMPTY_NODES: CwTreeNodeData[] = []
const EMPTY_KEYS: (string | number)[] = []
const EMPTY_KEY_SET: Set<string | number> = new Set()

function collectExpandableKeys(
  nodes: CwTreeNodeData[],
  keys: Set<string | number> = new Set(),
): Set<string | number> {
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      keys.add(node.key)
      collectExpandableKeys(node.children, keys)
    }
  })
  return keys
}

function treeChildrenShallowEqual(
  a: CwTreeNodeData[] | undefined,
  b: CwTreeNodeData[],
): boolean {
  if (!a || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!
    const y = b[i]!
    if (String(x.key) !== String(y.key)) return false
    if (String(x.label ?? '') !== String(y.label ?? '')) return false
    if (Boolean(x.isLeaf) !== Boolean(y.isLeaf)) return false
  }
  return true
}

/** 在 data / 懒加载缓存中找源节点（merge 后的行是浅拷贝，不能就地改 label） */
function findSourceNodeIn(
  nodes: CwTreeNodeData[],
  cache: Record<string, CwTreeNodeData[]>,
  key: string | number,
): CwTreeNodeData | null {
  const want = String(key)
  for (const node of nodes) {
    if (String(node.key) === want) return node
    const cached = cache[String(node.key)]
    if (cached?.length) {
      const hit = findSourceNodeIn(cached, cache, key)
      if (hit) return hit
    }
    if (node.children?.length) {
      const hit = findSourceNodeIn(node.children, cache, key)
      if (hit) return hit
    }
  }
  return null
}

function mergeTreeWithLazyCache(
  nodes: CwTreeNodeData[],
  cache: Record<string, CwTreeNodeData[]>,
): CwTreeNodeData[] {
  return nodes.map((node) => mergeNodeWithCache(node, cache))
}

function mergeNodeWithCache(
  node: CwTreeNodeData,
  cache: Record<string, CwTreeNodeData[]>,
): CwTreeNodeData {
  const key = String(node.key)
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return {
      ...node,
      children: cache[key]!.map((child) => mergeNodeWithCache(child, cache)),
    }
  }
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map((child) => mergeNodeWithCache(child, cache)),
    }
  }
  return { ...node }
}

export function CwTree({
  data = EMPTY_NODES,
  defaultExpandAll = false,
  defaultExpandedKeys = EMPTY_KEYS,
  expandedKeys,
  defaultSelectedKeys = EMPTY_KEYS,
  selectedKeys,
  defaultCheckedKeys = EMPTY_KEYS,
  checkedKeys,
  checkable = false,
  selectable = true,
  folderSelectable = true,
  highlightParentOnChildSelected = false,
  multiple = true,
  showLine = false,
  showIcon = false,
  switcherIcon = true,
  reserveLeafSwitcherSpace = true,
  expandOnClickNode = false,
  accordion = false,
  indentSize = 24,
  draggable = false,
  reorderable = false,
  nodeDraggable,
  size = 'medium',
  texts: textsProp,
  loadData,
  lazyReloadToken,
  virtualScroll = false,
  virtualBuffer = 5,
  iconSlot,
  extraSlot,
  labelSlot,
  className,
  onNodeClick,
  onNodeContextmenu,
  onNodeSelect,
  onNodeCheck,
  onNodeExpand,
  onUpdateExpandedKeys,
  onUpdateSelectedKeys,
  onUpdateCheckedKeys,
  onNodeReorder,
  ...rest
}: CwTreeProps) {
  const stylesOverride = useCwTreeStylesOverride()
  const styles = useMemo(
    () => resolveCwTreeStyles(size || 'medium', stylesOverride),
    [size, stylesOverride],
  )

  const texts = useMemo<CwTreeTexts>(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  /** 懒加载：未展开前由外部 loadData 写入的子节点 */
  const [lazyChildCache, setLazyChildCache] = useState<
    Record<string, CwTreeNodeData[]>
  >({})
  const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(
    () => new Set(),
  )

  const startLazyLoading = useCallback((key: string | number) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const endLazyLoading = useCallback((key: string | number) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  const mergedData = useMemo(
    () => mergeTreeWithLazyCache(data, lazyChildCache),
    [data, lazyChildCache],
  )

  const tryExpandAndThen = useCallback(
    async (node: CwTreeNodeData): Promise<boolean> => {
      if (!loadData || node.isLeaf === true) return true
      const key = String(node.key)
      if (Object.prototype.hasOwnProperty.call(lazyChildCache, key)) return true
      if (node.isLeaf !== false) return true
      if (node.children !== undefined) return true
      startLazyLoading(key)
      try {
        // 必须改源节点：虚拟行上的 node 是 merge 浅拷贝
        const source = findSourceNodeIn(data, lazyChildCache, node.key) ?? node
        const children = await loadData(source)
        setLazyChildCache((prev) => ({ ...prev, [key]: children ?? [] }))
      } catch {
        return false
      } finally {
        endLazyLoading(key)
      }
      return true
    },
    [loadData, lazyChildCache, data, startLazyLoading, endLazyLoading],
  )

  const isLoadingKey = useCallback(
    (key: string | number) => loadingKeys.has(key),
    [loadingKeys],
  )

  const lazyContextValue = useMemo<CwTreeLazyContext>(
    () => ({
      tryExpandAndThen,
      isLoadingKey,
      loadDataEnabled: loadData != null,
    }),
    [tryExpandAndThen, isLoadingKey, loadData],
  )

  // 内部状态
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<
    Set<string | number>
  >(() =>
    defaultExpandAll
      ? collectExpandableKeys(data)
      : new Set(defaultExpandedKeys),
  )
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<
    Set<string | number>
  >(() => new Set(defaultSelectedKeys))
  const [internalCheckedKeys, setInternalCheckedKeys] = useState<
    Set<string | number>
  >(() => new Set(defaultCheckedKeys))

  // 计算展开/选中/勾选的 keys
  const expandedKeysSet = useMemo(
    () => (expandedKeys !== undefined ? new Set(expandedKeys) : internalExpandedKeys),
    [expandedKeys, internalExpandedKeys],
  )
  const selectedKeysSet = useMemo(
    () => (selectedKeys !== undefined ? new Set(selectedKeys) : internalSelectedKeys),
    [selectedKeys, internalSelectedKeys],
  )
  const checkedKeysSet = useMemo(() => {
    if (!checkable) return EMPTY_KEY_SET
    if (checkedKeys !== undefined) return new Set(checkedKeys)
    return internalCheckedKeys
  }, [checkable, checkedKeys, internalCheckedKeys])

  // ──────────── 虚拟滚动 ────────────
  const virtualScrollEnabled = virtualScroll === true
  const virtualBufferValue = Math.max(0, virtualBuffer ?? 5)
  const rowHeight = treeVirtualRowHeight(size || 'medium')

  const flatRows = useMemo(
    () =>
      virtualScrollEnabled
        ? flattenVisibleTreeRows(mergedData, expandedKeysSet)
        : [],
    [virtualScrollEnabled, mergedData, expandedKeysSet],
  )

  const bodyCwDivRef = useRef<CwDivHandle | null>(null)
  const [bodyViewport, setBodyViewport] = useState<HTMLElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useLayoutEffect(() => {
    if (!virtualScrollEnabled) {
      setBodyViewport(null)
      return
    }
    setBodyViewport(resolveCwDivViewport(bodyCwDivRef.current))
    bodyCwDivRef.current?.remeasure()
  }, [virtualScrollEnabled, flatRows])

  const { containerHeight } = useContainerSize(bodyViewport)

  const handleVirtualScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (!target) return
    setScrollTop(target.scrollTop)
  }

  const {
    visibleRows: visibleFlatRows,
    offsetTop,
    offsetBottom,
  } = useTreeVirtualScroll(
    flatRows,
    virtualScrollEnabled,
    rowHeight,
    containerHeight,
    scrollTop,
    virtualBufferValue,
  )

  // 初始化
  useEffect(() => {
    // 有 loadData 时由 lazyReloadToken / remount 管缓存；改 data 不冲掉已展开目录
    if (!loadData) {
      setLazyChildCache({})
      if (defaultExpandAll) {
        setInternalExpandedKeys(collectExpandableKeys(data))
      } else if (defaultExpandedKeys.length > 0) {
        setInternalExpandedKeys(new Set(defaultExpandedKeys))
      }
    }
    if (defaultSelectedKeys.length > 0) {
      setInternalSelectedKeys(new Set(defaultSelectedKeys))
    }
    if (defaultCheckedKeys.length > 0) {
      setInternalCheckedKeys(new Set(defaultCheckedKeys))
    }
    // 仅响应数据源变化，与 Vue watch(data) 对齐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const prevDefaultExpandAllRef = useRef(defaultExpandAll)
  useEffect(() => {
    if (prevDefaultExpandAllRef.current === defaultExpandAll) return
    prevDefaultExpandAllRef.current = defaultExpandAll
    if (defaultExpandAll) {
      setInternalExpandedKeys(collectExpandableKeys(mergedData))
    } else if (defaultExpandedKeys.length > 0) {
      setInternalExpandedKeys(new Set(defaultExpandedKeys))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpandAll])

  const prevLazyReloadTokenRef = useRef<number | undefined>(lazyReloadToken)
  useEffect(() => {
    const token = lazyReloadToken
    if (token == null || token === prevLazyReloadTokenRef.current) return
    prevLazyReloadTokenRef.current = token
    if (!loadData) {
      setLazyChildCache({})
      return
    }
    let cancelled = false
    const run = async () => {
      // 无感刷新：保留旧缓存直到各目录 loadData 完成再就地替换
      const keys = [...expandedKeysSet].sort((a, b) => {
        const da = String(a).split('/').length
        const db = String(b).split('/').length
        return da - db
      })
      let nextCache: Record<string, CwTreeNodeData[]> = { ...lazyChildCache }
      for (const key of keys) {
        if (cancelled) return
        const source = findSourceNodeIn(data, nextCache, key)
        if (!source || source.isLeaf === true) continue
        // 已有内联 children 的节点由 data 软刷新直接更新，跳过
        if (source.children !== undefined) continue
        const cacheKey = String(key)
        startLazyLoading(key)
        try {
          const children = (await loadData(source)) ?? []
          if (cancelled) return
          if (treeChildrenShallowEqual(nextCache[cacheKey], children)) continue
          nextCache = { ...nextCache, [cacheKey]: children }
          setLazyChildCache({ ...nextCache })
        } catch {
          if (cancelled) return
          if (!treeChildrenShallowEqual(nextCache[cacheKey], [])) {
            nextCache = { ...nextCache, [cacheKey]: [] }
            setLazyChildCache({ ...nextCache })
          }
        } finally {
          endLazyLoading(key)
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyReloadToken])

  // 事件处理
  const handleNodeClick = (
    node: CwTreeNodeData,
    event: CwTreeInteractionEvent,
  ) => {
    onNodeClick?.(node, event)
  }

  const handleNodeContextMenu = (
    node: CwTreeNodeData,
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    onNodeContextmenu?.(node, event)
  }

  const selectionAnchorKey = useRef<string | number | null>(null)

  const handleNodeSelect = useCallback(
    (
      nextSelectedKeys: (string | number)[],
      info: CwTreeSelectInfo,
    ) => {
      if (!selectable) return

      let nextKeys = nextSelectedKeys
      if (multiple && info.event) {
        nextKeys = resolveTreeMultiSelectKeys({
          clickedKey: info.node.key,
          event: info.event,
          currentKeys: Array.from(selectedKeysSet),
          visibleSelectableKeys: collectVisibleSelectableKeys(
            mergedData,
            expandedKeysSet,
            folderSelectable !== false,
          ),
          selectionAnchorKey: selectionAnchorKey.current,
        })
        if (!info.event.shiftKey) {
          selectionAnchorKey.current = info.node.key
        } else if (selectionAnchorKey.current == null) {
          selectionAnchorKey.current = info.node.key
        }
      } else if (!multiple) {
        selectionAnchorKey.current = info.node.key
      }

      setInternalSelectedKeys(new Set(nextKeys))
      onNodeSelect?.(nextKeys, info)
      onUpdateSelectedKeys?.(nextKeys)
    },
    [
      selectable,
      multiple,
      selectedKeysSet,
      mergedData,
      expandedKeysSet,
      folderSelectable,
      onNodeSelect,
      onUpdateSelectedKeys,
    ],
  )

  useEffect(() => {
    if (!selectedKeys?.length) {
      selectionAnchorKey.current = null
      return
    }
    if (
      selectionAnchorKey.current != null &&
      selectedKeys.includes(selectionAnchorKey.current)
    ) {
      return
    }
    selectionAnchorKey.current = selectedKeys[selectedKeys.length - 1] ?? null
  }, [selectedKeys])

  const handleNodeCheck = (
    nextCheckedKeys: (string | number)[],
    info: CwTreeCheckInfo,
  ) => {
    if (!checkable) return

    setInternalCheckedKeys(new Set(nextCheckedKeys))
    onNodeCheck?.(nextCheckedKeys, info)
    onUpdateCheckedKeys?.(nextCheckedKeys)
  }

  const handleNodeExpand = (
    nextExpandedKeys: (string | number)[],
    info: CwTreeExpandInfo,
  ) => {
    let finalExpandedKeys = nextExpandedKeys

    // 手风琴模式：同级节点最多只能有一个展开
    if (accordion && info.expanded) {
      const findSiblingKeys = (
        nodes: CwTreeNodeData[],
        targetKey: string | number,
      ): (string | number)[] => {
        for (const node of nodes) {
          if (node.key === targetKey) {
            return nodes.filter((n) => n.key !== targetKey).map((n) => n.key)
          }
          if (node.children && node.children.length > 0) {
            const siblingKeys = findSiblingKeys(node.children, targetKey)
            if (siblingKeys.length > 0) {
              return siblingKeys
            }
          }
        }
        return []
      }

      const collectChildrenKeys = (
        node: CwTreeNodeData,
        keys: Set<string | number>,
      ) => {
        if (node.children) {
          node.children.forEach((child) => {
            keys.add(child.key)
            collectChildrenKeys(child, keys)
          })
        }
      }

      const siblingKeys = findSiblingKeys(mergedData, info.node.key)
      const keysToRemove = new Set<string | number>()
      siblingKeys.forEach((siblingKey) => {
        keysToRemove.add(siblingKey)
        const findAndCollect = (
          nodes: CwTreeNodeData[],
          targetKey: string | number,
        ): boolean => {
          for (const node of nodes) {
            if (node.key === targetKey) {
              collectChildrenKeys(node, keysToRemove)
              return true
            }
            if (node.children) {
              if (findAndCollect(node.children, targetKey)) {
                return true
              }
            }
          }
          return false
        }
        findAndCollect(mergedData, siblingKey)
      })

      finalExpandedKeys = nextExpandedKeys.filter(
        (key) => !keysToRemove.has(key),
      )
    }

    setInternalExpandedKeys(new Set(finalExpandedKeys))
    onNodeExpand?.(finalExpandedKeys, info)
    onUpdateExpandedKeys?.(finalExpandedKeys)
  }

  const [reorderDraggingKey, setReorderDraggingKey] = useState<
    string | number | null
  >(null)
  const [reorderDropTarget, setReorderDropTarget] =
    useState<CwTreeReorderDropTarget | null>(null)

  const reorderContextValue = useMemo<CwTreeReorderContext>(
    () => ({
      draggingKey: reorderDraggingKey,
      dropTarget: reorderDropTarget,
      startDrag(key) {
        setReorderDraggingKey(key)
      },
      endDrag() {
        setReorderDraggingKey(null)
        setReorderDropTarget(null)
      },
      setDropTarget(key, position) {
        setReorderDropTarget({ key, position })
      },
      clearDropTarget() {
        setReorderDropTarget(null)
      },
    }),
    [reorderDraggingKey, reorderDropTarget],
  )

  const handleNodeReorder = (payload: CwTreeReorderPayload) => {
    setReorderDraggingKey(null)
    setReorderDropTarget(null)
    onNodeReorder?.(payload)
  }

  const renderTreeNode = (
    node: CwTreeNodeData,
    level: number,
    parentPath: (string | number)[],
    renderChildren: boolean,
    showLineValue: boolean,
  ) => (
    <CwTreeNodeComponent
      key={node.key}
      node={node}
      level={level}
      expandedKeys={expandedKeysSet}
      selectedKeys={selectedKeysSet}
      checkedKeys={checkedKeysSet}
      checkable={checkable}
      selectable={selectable}
      folderSelectable={folderSelectable}
      highlightParentOnChildSelected={highlightParentOnChildSelected}
      multiple={multiple}
      showLine={showLineValue}
      showIcon={showIcon}
      switcherIcon={switcherIcon}
      reserveLeafSwitcherSpace={reserveLeafSwitcherSpace}
      expandOnClickNode={expandOnClickNode}
      accordion={accordion}
      indentSize={indentSize}
      size={size}
      draggable={draggable}
      reorderable={reorderable}
      nodeDraggable={nodeDraggable}
      treeStyles={styles}
      texts={texts}
      parentPath={parentPath}
      renderChildren={renderChildren}
      iconSlot={iconSlot}
      extraSlot={extraSlot}
      labelSlot={labelSlot}
      onNodeClick={handleNodeClick}
      onNodeContextmenu={handleNodeContextMenu}
      onNodeSelect={handleNodeSelect}
      onNodeCheck={handleNodeCheck}
      onNodeExpand={handleNodeExpand}
      onNodeReorder={handleNodeReorder}
    />
  )

  const rootClassName = [
    styles.root,
    virtualScrollEnabled ? 'flex h-full min-h-0 flex-col' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <CW_TREE_LAZY_CONTEXT.Provider value={lazyContextValue}>
      <CW_TREE_REORDER_CONTEXT.Provider value={reorderContextValue}>
        <div {...rest} role="tree" className={rootClassName}>
          {virtualScrollEnabled ? (
            <CwDiv
              ref={bodyCwDivRef}
              className="min-h-0 w-full flex-1"
              onScroll={handleVirtualScroll}
            >
              {offsetTop > 0 ? (
                <div
                  style={{ height: `${offsetTop}px` }}
                  aria-hidden="true"
                />
              ) : null}
              {visibleFlatRows.map((row) =>
                renderTreeNode(
                  row.node,
                  row.level,
                  row.parentPath,
                  false,
                  false,
                ),
              )}
              {offsetBottom > 0 ? (
                <div
                  style={{ height: `${offsetBottom}px` }}
                  aria-hidden="true"
                />
              ) : null}
            </CwDiv>
          ) : (
            mergedData.map((node) =>
              renderTreeNode(node, 0, [], true, showLine ?? false),
            )
          )}
        </div>
      </CW_TREE_REORDER_CONTEXT.Provider>
    </CW_TREE_LAZY_CONTEXT.Provider>
  )
}

export default CwTree
