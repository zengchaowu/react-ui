import type { MouseEvent as ReactMouseEvent } from 'react'
import ExcelGridCell from './ExcelGridCell'
import { excelEditorBase } from '@zengchaowu/ui-shared/components/CwExcelEditor/styles'

export interface ExcelMergePiece {
  key: string
  anchorKey: string
  row: number
  col: number
  showText: boolean
  text: string
  align: 'left' | 'center' | 'right'
  css?: Record<string, string>
  borderShadow?: string
  borderRight?: boolean
  borderBottom?: boolean
  edge: 'body' | 'header'
  style: Record<string, string>
}

export type ExcelMergeCommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

export interface ExcelMergeOverlayProps {
  pieces: ExcelMergePiece[]
  selectedKey?: string
  editingKey?: string
  draft?: string
  typeover?: string | null
  autofocus?: boolean
  readonly?: boolean
  onSelect?: (row: number, col: number) => void
  onEdit?: (row: number, col: number) => void
  onInput?: (value: string) => void
  onCancel?: () => void
  onCommit?: (payload: {
    row: number
    col: number
    value: string
    move: ExcelMergeCommitMove
  }) => void
}

function isFieldTarget(event: ReactMouseEvent) {
  const target = event.target
  return target instanceof Element && !!target.closest('input, textarea')
}

export default function ExcelMergeOverlay({
  pieces,
  selectedKey = '',
  editingKey = '',
  draft = '',
  typeover = null,
  autofocus = false,
  readonly = false,
  onSelect,
  onEdit,
  onInput,
  onCancel,
  onCommit,
}: ExcelMergeOverlayProps) {
  function onPieceClick(event: ReactMouseEvent, piece: ExcelMergePiece) {
    if (isFieldTarget(event)) return
    onSelect?.(piece.row, piece.col)
  }

  function onPieceEdit(event: ReactMouseEvent, piece: ExcelMergePiece) {
    if (isFieldTarget(event)) return
    onEdit?.(piece.row, piece.col)
  }

  return (
    <div className={excelEditorBase.mergeLayer}>
      {pieces.map((piece) => (
        <div
          key={piece.key}
          className={[
            excelEditorBase.mergeCell,
            selectedKey === piece.anchorKey ? excelEditorBase.mergeSelected : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={piece.style}
          data-excel-merge={piece.anchorKey}
          data-excel-row={piece.row}
          data-excel-col={piece.col}
          data-excel-br={piece.borderRight ? '' : undefined}
          data-excel-bb={piece.borderBottom ? '' : undefined}
          onClick={(event) => onPieceClick(event, piece)}
          onDoubleClick={(event) => {
            event.stopPropagation()
            onPieceEdit(event, piece)
          }}
        >
          {piece.borderShadow ? (
            <span
              className="cw-excel-merge-border pointer-events-none absolute inset-0"
              data-excel-br={piece.borderRight ? '' : undefined}
              data-excel-bb={piece.borderBottom ? '' : undefined}
              style={{ boxShadow: piece.borderShadow }}
            />
          ) : null}
          {piece.showText ? (
            <ExcelGridCell
              surface="merge"
              text={piece.text}
              align={piece.align}
              css={piece.css}
              selected={false}
              readonly={readonly}
              editing={editingKey === piece.anchorKey}
              draft={draft}
              typeover={typeover}
              autofocus={autofocus && editingKey === piece.anchorKey}
              onSelect={() => onSelect?.(piece.row, piece.col)}
              onEdit={() => onEdit?.(piece.row, piece.col)}
              onInput={(value) => onInput?.(value)}
              onCancel={() => onCancel?.()}
              onCommit={(payload) => onCommit?.({ row: piece.row, col: piece.col, ...payload })}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
