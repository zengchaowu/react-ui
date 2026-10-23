import type { CwDataTableRow, CwDataTableTreeRowMeta } from '../types'

/** 树形行元数据在 row 对象上的键（不可枚举，避免污染遍历） */
export const CW_DATA_TABLE_TREE_META_KEY = '__cwTableTreeMeta__'

export function resolveTreeRowKey(
  row: unknown,
  rowKey?: string,
  fallbackIndex?: number,
): string | number {
  if (rowKey && row != null) {
    const value = (row as Record<string, unknown>)[rowKey]
    if (value != null && (typeof value === 'string' || typeof value === 'number')) {
      return value
    }
  }
  if (fallbackIndex != null) return fallbackIndex
  return String(row)
}

export function setTreeRowMeta(row: CwDataTableRow, meta: CwDataTableTreeRowMeta): void {
  if (!row || typeof row !== 'object') return
  Object.defineProperty(row, CW_DATA_TABLE_TREE_META_KEY, {
    value: meta,
    enumerable: false,
    configurable: true,
    writable: true,
  })
}

export function getTreeRowMeta(
  row: CwDataTableRow | null | undefined,
): CwDataTableTreeRowMeta | undefined {
  if (!row || typeof row !== 'object') return undefined
  return row[CW_DATA_TABLE_TREE_META_KEY] as CwDataTableTreeRowMeta | undefined
}

export function getTreeChildren(row: CwDataTableRow, childrenKey: string): CwDataTableRow[] {
  const children = row?.[childrenKey]
  return Array.isArray(children) ? (children as CwDataTableRow[]) : []
}

export function hasTreeChildren(row: CwDataTableRow, childrenKey: string): boolean {
  return getTreeChildren(row, childrenKey).length > 0
}

/**
 * 按展开状态将树形数据拍平为可见行列表（保留原始 row 引用并写入树元数据）。
 */
export function flattenTreeRows(
  rows: CwDataTableRow[],
  options: {
    childrenKey: string
    rowKey?: string
    expandedKeys: Set<string | number>
    depth?: number
    startIndex?: number
  },
): CwDataTableRow[] {
  const out: CwDataTableRow[] = []
  const depth = options.depth ?? 0
  let index = options.startIndex ?? 0

  for (const row of rows) {
    const key = resolveTreeRowKey(row, options.rowKey, index)
    const children = getTreeChildren(row, options.childrenKey)
    const hasChildren = children.length > 0
    const expanded = hasChildren && options.expandedKeys.has(key)

    setTreeRowMeta(row, {
      depth,
      hasChildren,
      expanded,
      rowKey: key,
    })
    out.push(row)
    index += 1

    if (hasChildren && expanded) {
      const childRows = flattenTreeRows(children, {
        ...options,
        depth: depth + 1,
        startIndex: index,
      })
      out.push(...childRows)
      index += childRows.length
    }
  }

  return out
}

/** 收集所有可展开节点的 rowKey（有 children 的节点） */
export function collectExpandableTreeKeys(
  rows: CwDataTableRow[],
  childrenKey: string,
  rowKey?: string,
): Array<string | number> {
  const keys: Array<string | number> = []
  let index = 0

  function walk(nodes: CwDataTableRow[]) {
    for (const row of nodes) {
      const key = resolveTreeRowKey(row, rowKey, index)
      index += 1
      const children = getTreeChildren(row, childrenKey)
      if (children.length > 0) {
        keys.push(key)
        walk(children)
      }
    }
  }

  walk(rows)
  return keys
}

export interface GroupRowsByFieldAsTreeOptions<T> {
  /** 分组字段 */
  field: keyof T & string
  /** 分组行 id 前缀，默认 module */
  groupIdPrefix?: string
  /** 生成分组行 */
  buildGroupRow?: (
    groupValue: string,
    children: T[],
  ) => Record<string, unknown> & { children: T[] }
}

/**
 * 将扁平列表按字段分组为树（分组节点 + children 叶子列表），便于 CwDataTable tree 模式展示。
 */
export function groupRowsByFieldAsTree<T extends Record<string, unknown>>(
  rows: T[],
  options: GroupRowsByFieldAsTreeOptions<T>,
): Array<Record<string, unknown> & { children: T[] }> {
  const prefix = options.groupIdPrefix ?? 'group'
  const buckets = new Map<string, T[]>()

  for (const row of rows) {
    const raw = row[options.field]
    const key = String(raw ?? '').trim() || '其他'
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([groupValue, children]) => {
      if (options.buildGroupRow) {
        return options.buildGroupRow(groupValue, children)
      }
      return {
        id: `${prefix}:${groupValue}`,
        name: groupValue,
        code: '',
        module: groupValue,
        description: `${children.length} 项`,
        children,
      }
    })
}
