import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { docxEditorBase } from './styles'
import type { CwDocxParagraphBlockProps } from './types'
import { paragraphLayoutStyle, runLayoutStyle } from './functions/paragraphDisplay'
import { runsFromEditableRoot } from './functions/editableRuns'

export function CwDocxParagraphBlock({
  block,
  editable,
  wrapperClass,
  listLabel,
  onUpdateRuns,
}: CwDocxParagraphBlockProps) {
  const editableRef = useRef<HTMLDivElement | null>(null)
  const layoutStyle = paragraphLayoutStyle(block) as CSSProperties

  function onBlur() {
    const root = editableRef.current
    if (!root) return
    onUpdateRuns?.(runsFromEditableRoot(root))
  }

  const runs = block.runs

  // contenteditable 的 DOM 由用户编辑，不能让 React 托管子节点：
  // 与 Vue 的 deep watch 一致，仅当块数据外部变化且段落不处于焦点时重建 span。
  useLayoutEffect(() => {
    if (!editable) return
    const root = editableRef.current
    if (!root || root === document.activeElement) return
    root.innerHTML = ''
    for (const run of runs) {
      const span = document.createElement('span')
      span.className = docxEditorBase.run
      Object.assign(span.style, runLayoutStyle(run))
      span.textContent = run.text
      root.appendChild(span)
    }
  }, [runs, editable])

  return (
    <div
      className={[...wrapperClass, listLabel ? 'flex flex-wrap items-baseline gap-1' : '']
        .filter(Boolean)
        .join(' ')}
      style={layoutStyle}
    >
      {listLabel ? <span className={docxEditorBase.listLabel}>{listLabel}</span> : null}
      {editable ? (
        <div
          ref={editableRef}
          className={docxEditorBase.paragraphBody}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onBlur={onBlur}
        />
      ) : (
        <div className={docxEditorBase.paragraphBody}>
          {runs.map((run, index) => (
            <span key={index} className={docxEditorBase.run} style={runLayoutStyle(run) as CSSProperties}>
              {run.text}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default CwDocxParagraphBlock
