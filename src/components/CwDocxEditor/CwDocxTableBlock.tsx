import CwDocxParagraphBlock from './CwDocxParagraphBlock'
import { docxEditorBase } from '@zengchaowu/ui-shared/components/CwDocxEditor/styles'
import type { CwDocxTableBlockProps } from './types'
import type { CwDocxInlineParagraph, CwDocxRun, CwDocxTableCell } from '@zengchaowu/ui-shared/components/CwDocxEditor/types'

export function CwDocxTableBlock({ block, editable, onChange }: CwDocxTableBlockProps) {
  function paragraphClass(paragraph: CwDocxInlineParagraph) {
    const level =
      paragraph.level >= 3
        ? docxEditorBase.heading3
        : paragraph.level === 2
          ? docxEditorBase.heading2
          : paragraph.level === 1
            ? docxEditorBase.heading1
            : docxEditorBase.paragraph
    return [level]
  }

  function onCellParagraph(cell: CwDocxTableCell, para: CwDocxInlineParagraph, runs: CwDocxRun[]) {
    if (JSON.stringify(para.runs) === JSON.stringify(runs)) return
    para.runs = runs
    onChange?.()
  }

  return (
    <table className={docxEditorBase.table}>
      <tbody>
        {block.rows.map((row, rowIndex) => (
          <tr key={rowIndex} className={docxEditorBase.row}>
            {row.map((cell, cellIndex) =>
              cell.vMergeContinue ? null : (
                <td
                  key={cellIndex}
                  className={docxEditorBase.cell}
                  colSpan={cell.colSpan && cell.colSpan > 1 ? cell.colSpan : undefined}
                >
                  {cell.paragraphs.map((para) => (
                    <CwDocxParagraphBlock
                      key={para.id}
                      block={para}
                      editable={editable}
                      wrapperClass={paragraphClass(para)}
                      onUpdateRuns={(runs) => onCellParagraph(cell, para, runs)}
                    />
                  ))}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CwDocxTableBlock
