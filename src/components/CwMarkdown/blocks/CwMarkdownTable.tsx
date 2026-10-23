import { useState } from 'react'
import type { CwMarkdownInlineNode, CwMarkdownTableBlock } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from '../inlines/CwMarkdownInlineRenderer'
import { CwDataTable } from '../../CwDataTable'
import type { CwDataTableConfig } from '../../CwDataTable'

export interface CwMarkdownTableProps {
  block: CwMarkdownTableBlock
}

/** 供列 title/无障碍使用；全空时用 NBSP 避免 0 宽列 */
function inlineNodesToPlainText(nodes: CwMarkdownInlineNode[]): string {
  if (!nodes?.length) return '\u00a0'
  const t = nodes
    .map((n) => {
      if (n.type === 'text') return n.value
      if (n.type === 'code') return n.value
      if (n.type === 'link' || n.type === 'bold' || n.type === 'italic')
        return inlineNodesToPlainText(n.children)
      if (n.type === 'image') return n.alt || ''
      if (n.type === 'imMention') {
        const lb = n.label?.trim()
        return lb ? `@${lb}` : `@${n.userId}`
      }
      return ''
    })
    .join('')
    .trim()
  return t || '\u00a0'
}

export function CwMarkdownTable({ block }: CwMarkdownTableProps) {
  const ctx = useCwMarkdownContext()

  /** 表格表体默认展开；与 CwDataTable collapsible-body 绑定 */
  const [tableBodyExpanded, setTableBodyExpanded] = useState(true)

  const sizeClass =
    ctx.size === 'small'
      ? ctx.styles.sizeSmall
      : ctx.size === 'large'
        ? ctx.styles.sizeLarge
        : ctx.styles.sizeMedium

  const dataTableTexts = {
    collapseBodyExpandAriaLabel: ctx.texts.tableBodyExpandAriaLabel,
    collapseBodyCollapseAriaLabel: ctx.texts.tableBodyCollapseAriaLabel,
  }

  const columns = block.header.map((headerCell, ci) => {
    const align = block.columnAlign[ci] ?? 'left'
    const key = `c${ci}`
    return {
      key,
      title: inlineNodesToPlainText(headerCell),
      align,
      sortable: false,
      resizable: false,
      wrap: true,
      fitContent: true,
      headerRender: () => <CwMarkdownInlineRenderer nodes={headerCell} />,
      cellRender: (cellCtx: { row: Record<string, unknown> }) => {
        const value = cellCtx.row[key]
        return (
          <CwMarkdownInlineRenderer
            nodes={Array.isArray(value) ? (value as CwMarkdownInlineNode[]) : []}
          />
        )
      },
    }
  })

  const dataTableConfig: CwDataTableConfig = {
    columns,
    showHeader: true,
    resizable: false,
    virtualScroll: false,
    sort: { defaultSortable: false },
    rowKey: '_id',
    syncColumnWidthsFromBody: true,
    defaultExpandFillColumns: false,
    stretchFitColumnsToContainer: true,
    /** 内嵌 markdown 表：高度随行数，由消息区外层滚动 */
    bodyLayout: 'content',
  }

  const keys = block.header.map((_, ci) => `c${ci}`)
  const pack = (row: CwMarkdownInlineNode[][]) => {
    const o: Record<string, unknown> = {}
    keys.forEach((k, ci) => {
      o[k] = row[ci] ?? []
    })
    return o
  }

  const tableRows =
    block.body.length === 0
      ? [
          {
            _id: 'r-empty',
            ...pack(block.header.map(() => [] as CwMarkdownInlineNode[])),
          },
        ]
      : block.body.map((row, ri) => ({
          _id: `r${ri}`,
          ...pack(row),
        }))

  return (
    <div className={[ctx.styles.tableWrapper, sizeClass].filter(Boolean).join(' ')}>
      <CwDataTable
        collapsibleBody
        bodyExpanded={tableBodyExpanded}
        onUpdateBodyExpanded={setTableBodyExpanded}
        appearance="markdown"
        config={dataTableConfig}
        modelValue={tableRows}
        texts={dataTableTexts}
      />
    </div>
  )
}

export default CwMarkdownTable
