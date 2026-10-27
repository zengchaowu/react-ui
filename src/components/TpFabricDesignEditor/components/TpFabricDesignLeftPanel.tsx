import { useEffect, useMemo, useRef, useState } from 'react'
import CwDesignLayersPanel from '../../CwDesignLayersPanel/CwDesignLayersPanel'
import CwIcon from '../../CwIcon/CwIcon'
import CwInput from '../../CwInput/CwInput'
import CwTabsStrip from '../../CwTabsStrip/CwTabsStrip'
import type { CwTreeNode } from '../../CwTree/types'
import type {
  FabricEditorComponent,
  FabricEditorPage,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorPages.pure'
import {
  filterFabricEditorComponents,
  TP_FABRIC_DESIGN_LEFT_TABS,
  type TpFabricDesignLeftTab,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/components/tpFabricDesignLeftPanel.pure'

export interface TpFabricDesignLeftPanelProps {
  readonly?: boolean
  switching?: boolean
  pages: FabricEditorPage[]
  activePageId: string
  layerData: CwTreeNode[]
  layerSelectedKeys: (string | number)[]
  layerSelectable?: boolean
  layerRenameable?: boolean
  layerReorderable?: boolean
  components: FabricEditorComponent[]
  canCreateComponent?: boolean
  /** 等价 Vue `select-page` */
  onSelectPage?: (pageId: string) => void
  /** 等价 Vue `add-page` */
  onAddPage?: () => void
  /** 等价 Vue `delete-page` */
  onDeletePage?: (pageId: string) => void
  /** 等价 Vue `rename-page` */
  onRenamePage?: (pageId: string, name: string) => void
  /** 等价 Vue `update:layerSelectedKeys` */
  onLayerSelectedKeysChange?: (keys: (string | number)[]) => void
  /** 等价 Vue `layer-rename` */
  onLayerRename?: (key: string | number, name: string) => void
  /** 等价 Vue `layer-toggle-visible` */
  onLayerToggleVisible?: (key: string | number) => void
  /** 等价 Vue `layer-toggle-locked` */
  onLayerToggleLocked?: (key: string | number) => void
  /** 等价 Vue `layer-reorder` */
  onLayerReorder?: (payload: {
    dragKey: string | number
    dropKey: string | number
    position: 'before' | 'after' | 'inside'
  }) => void
  /** 等价 Vue `layer-context-menu` */
  onLayerContextMenu?: (node: CwTreeNode, event: MouseEvent) => void
  /** 等价 Vue `create-component` */
  onCreateComponent?: () => void
  /** 等价 Vue `place-component` */
  onPlaceComponent?: (componentId: string) => void
  /** 等价 Vue `rename-component` */
  onRenameComponent?: (componentId: string, name: string) => void
  /** 等价 Vue `delete-component` */
  onDeleteComponent?: (componentId: string) => void
}

export function TpFabricDesignLeftPanel({
  readonly = false,
  switching = false,
  pages,
  activePageId,
  layerData,
  layerSelectedKeys,
  layerSelectable = true,
  layerRenameable = true,
  layerReorderable = true,
  components,
  canCreateComponent = false,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onLayerSelectedKeysChange,
  onLayerRename,
  onLayerToggleVisible,
  onLayerToggleLocked,
  onLayerReorder,
  onLayerContextMenu,
  onCreateComponent,
  onPlaceComponent,
  onRenameComponent,
  onDeleteComponent,
}: TpFabricDesignLeftPanelProps) {
  const [activeTab, setActiveTab] = useState<TpFabricDesignLeftTab>('layers')
  const [searchQuery, setSearchQuery] = useState('')
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null)
  const [renamingPageValue, setRenamingPageValue] = useState('')
  const [renamingComponentId, setRenamingComponentId] = useState<string | null>(null)
  const [renamingComponentValue, setRenamingComponentValue] = useState('')

  const searchPlaceholder =
    activeTab === 'components' ? '搜索组件名称' : '搜索图层名称'

  const filteredLayerData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || activeTab !== 'layers') return layerData
    const filterNodes = (nodes: CwTreeNode[]): CwTreeNode[] => {
      const out: CwTreeNode[] = []
      for (const node of nodes) {
        const label = String(node.label ?? '').toLowerCase()
        const kids = node.children ? filterNodes(node.children) : []
        if (label.includes(q) || kids.length) {
          out.push(kids.length ? { ...node, children: kids } : node)
        }
      }
      return out
    }
    return filterNodes(layerData)
  }, [searchQuery, activeTab, layerData])

  const filteredComponents = useMemo(
    () => filterFabricEditorComponents(components, searchQuery),
    [components, searchQuery],
  )

  const layerEmptyText = searchQuery.trim() ? '无匹配图层' : '暂无图层'

  const componentsEmptyText = searchQuery.trim()
    ? '无匹配组件'
    : '暂无组件，选中图层后点「从选区创建」'

  function cancelRenamePage() {
    setRenamingPageId(null)
  }

  function cancelRenameComponent() {
    setRenamingComponentId(null)
  }

  // 等价 Vue watch(activeTab)（非 immediate）
  const firstTabRef = useRef(true)
  useEffect(() => {
    if (firstTabRef.current) {
      firstTabRef.current = false
      return
    }
    setSearchQuery('')
    cancelRenamePage()
    cancelRenameComponent()
  }, [activeTab])

  function startRenamePage(page: FabricEditorPage) {
    if (readonly) return
    setRenamingPageId(page.id)
    setRenamingPageValue(page.name)
  }

  function commitRenamePage() {
    const id = renamingPageId
    if (!id) return
    const name = renamingPageValue
    setRenamingPageId(null)
    onRenamePage?.(id, name)
  }

  function startRenameComponent(comp: FabricEditorComponent) {
    if (readonly) return
    setRenamingComponentId(comp.id)
    setRenamingComponentValue(comp.name)
  }

  function commitRenameComponent() {
    const id = renamingComponentId
    if (!id) return
    const name = renamingComponentValue
    setRenamingComponentId(null)
    onRenameComponent?.(id, name)
  }

  return (
    <aside
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--bg-color-container)]"
      aria-label="设计资源"
    >
      <div className="shrink-0 hairline-border-b border-[var(--border-color)] px-2 pt-1">
        <CwTabsStrip
          value={activeTab}
          items={TP_FABRIC_DESIGN_LEFT_TABS}
          size="small"
          tabFlushStart
          tabFlushEnd
          texts={{ tablistLabel: '左侧面板' }}
          onChange={(_index, value) => {
            if (value != null) setActiveTab(value as TpFabricDesignLeftTab)
          }}
        />
      </div>

      {(activeTab === 'layers' || activeTab === 'components') && (
        <div className="shrink-0 px-2 py-1.5">
          <CwInput
            value={searchQuery}
            size="small"
            clearable
            placeholder={searchPlaceholder}
            onChange={(v) => setSearchQuery(v)}
            iconSlot={
              <CwIcon name="common--action--search-line" prefix="icon" size={0.875} />
            }
          />
        </div>
      )}

      {activeTab === 'layers' ? (
        <>
          <section className="flex min-h-[7.5rem] shrink-0 flex-col hairline-border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <span className="text-xs font-medium text-[var(--text-color-secondary)]">
                页面
              </span>
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-color-placeholder)] transition-colors hover:bg-[var(--bg-color-secondarycontainer)] hover:text-[var(--text-color-primary)] disabled:opacity-40"
                title="新建页面"
                aria-label="新建页面"
                disabled={readonly || switching}
                onClick={() => onAddPage?.()}
              >
                <CwIcon
                  name="common--action--circle-add-line"
                  prefix="icon"
                  size={0.875}
                />
              </button>
            </div>
            <ul
              className="min-h-0 flex-1 overflow-auto px-1 pb-2 max-h-36"
              role="listbox"
              aria-label="页面列表"
            >
              {pages.map((page) => (
                <li
                  key={page.id}
                  role="option"
                  aria-selected={page.id === activePageId}
                  className={[
                    'group flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors',
                    page.id === activePageId
                      ? 'bg-[var(--bg-color-secondarycontainer)] text-[var(--text-color-primary)]'
                      : 'text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-secondarycontainer)]',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectPage?.(page.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    startRenamePage(page)
                  }}
                >
                  <span
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[var(--text-color-placeholder)]"
                    aria-hidden="true"
                  >
                    <CwIcon name="common--nav--page-line" prefix="icon" size={0.875} />
                  </span>
                  {renamingPageId === page.id ? (
                    <CwInput
                      value={renamingPageValue}
                      size="small"
                      showLabel={false}
                      className="min-w-0 flex-1"
                      onChange={(v) => setRenamingPageValue(v)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          commitRenamePage()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          cancelRenamePage()
                        }
                      }}
                      onBlur={() => commitRenamePage()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{page.name}</span>
                  )}
                  {pages.length > 1 && !readonly && (
                    <button
                      type="button"
                      className="invisible inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-color-placeholder)] hover:text-[var(--error-color-6)] group-hover:visible"
                      title="删除页面"
                      aria-label="删除页面"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePage?.(page.id)
                      }}
                    >
                      <CwIcon name="draw--canvas--delete-line" prefix="icon" size={0.75} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <CwDesignLayersPanel
              layout="embedded"
              data={filteredLayerData}
              selectedKeys={layerSelectedKeys}
              selectable={layerSelectable}
              renameable={layerRenameable}
              reorderable={layerReorderable}
              searchable={false}
              texts={{ title: '图层', emptyLayers: layerEmptyText }}
              onSelectedKeysChange={(keys) => onLayerSelectedKeysChange?.(keys)}
              onRename={(key, name) => onLayerRename?.(key, name)}
              onToggleVisible={(key) => onLayerToggleVisible?.(key)}
              onToggleLocked={(key) => onLayerToggleLocked?.(key)}
              onReorder={(payload) => onLayerReorder?.(payload)}
              onNodeContextmenu={(node, event) =>
                onLayerContextMenu?.(node, event.nativeEvent)
              }
            />
          </div>
        </>
      ) : activeTab === 'components' ? (
        <>
          <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-1.5">
            <span className="text-xs font-medium text-[var(--text-color-secondary)]">
              组件
            </span>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded px-1.5 text-xs text-[var(--brand-color-6)] transition-colors hover:bg-[var(--bg-color-secondarycontainer)] disabled:opacity-40"
              disabled={readonly || !canCreateComponent}
              title="将当前选区创建为组件"
              onClick={() => onCreateComponent?.()}
            >
              <CwIcon
                name="common--action--circle-add-line"
                prefix="icon"
                size={0.75}
              />
              从选区创建
            </button>
          </div>
          {filteredComponents.length ? (
            <ul className="min-h-0 flex-1 overflow-auto px-1 pb-2">
              {filteredComponents.map((comp) => (
                <li
                  key={comp.id}
                  className="group flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-xs text-[var(--text-color-primary)] transition-colors hover:bg-[var(--bg-color-secondarycontainer)]"
                  onClick={() => onPlaceComponent?.(comp.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    startRenameComponent(comp)
                  }}
                >
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] text-[var(--text-color-placeholder)]"
                    aria-hidden="true"
                  >
                    <CwIcon name="draw--shape--rect-line" prefix="icon" size={1} />
                  </span>
                  {renamingComponentId === comp.id ? (
                    <CwInput
                      value={renamingComponentValue}
                      size="small"
                      showLabel={false}
                      className="min-w-0 flex-1"
                      onChange={(v) => setRenamingComponentValue(v)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          commitRenameComponent()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          cancelRenameComponent()
                        }
                      }}
                      onBlur={() => commitRenameComponent()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{comp.name}</span>
                  )}
                  {!readonly && (
                    <button
                      type="button"
                      className="invisible inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-color-placeholder)] hover:text-[var(--error-color-6)] group-hover:visible"
                      title="删除组件"
                      aria-label="删除组件"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteComponent?.(comp.id)
                      }}
                    >
                      <CwIcon name="draw--canvas--delete-line" prefix="icon" size={0.75} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-xs text-[var(--text-color-placeholder)]">
              {componentsEmptyText}
            </p>
          )}
        </>
      ) : (
        <p className="px-3 py-8 text-center text-xs text-[var(--text-color-placeholder)]">
          {activeTab === 'ai' ? 'AI 能力即将开放' : '资源库即将开放'}
        </p>
      )}
    </aside>
  )
}

export default TpFabricDesignLeftPanel
