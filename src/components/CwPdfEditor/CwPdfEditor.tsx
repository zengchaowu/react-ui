import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { CwDiv } from '../CwDiv'
import type { CwDivHandle } from '../CwDiv'
import { CwLoading } from '../CwLoading'
import { useCwPdfEditor } from './composables/useCwPdfEditor'
import { pdfEditorBase } from './styles'
import type { CwPdfEditorEmits, CwPdfEditorHandle, CwPdfEditorProps } from './types'

export interface CwPdfEditorComponentProps
  extends CwPdfEditorProps,
    CwPdfEditorEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onChange'> {
  className?: string
}

export const CwPdfEditor = forwardRef<CwPdfEditorHandle, CwPdfEditorComponentProps>(
  function CwPdfEditor(props, ref) {
    const {
      modelValue,
      src = null,
      mode = 'edit',
      readonly = false,
      showHeader = true,
      texts: textsProp,
      onModelValueChange,
      onChange,
      className,
      ...rest
    } = props

    const rootRef = useRef<HTMLDivElement | null>(null)
    const stageRef = useRef<CwDivHandle | null>(null)

    const {
      texts,
      previewing,
      pdf,
      loading,
      error,
      selected,
      setSelected,
      editingRunId,
      pageWidth,
      totalHeight,
      visibleSlots,
      pageLabel,
      zoomBy,
      rotateSelected,
      duplicateSelected,
      addBlankAfter,
      deleteSelected,
      moveSelected,
      addNote,
      runEditorStyle,
      mountRunEditor,
      visibleRuns,
      runStyle,
      noteStyle,
      noteFontPx,
      onRunMouseDown,
      onRunPointerDown,
      onRunBlur,
      onRunKeydown,
      onRunPaste,
      onRunInput,
      onNoteInput,
      onNotePointerDown,
      onKeydown,
      onScroll,
      toArrayBuffer,
    } = useCwPdfEditor({
      props: {
        modelValue,
        src,
        mode,
        readonly,
        showHeader,
        texts: textsProp,
        onModelValueChange,
        onChange,
      },
      stageRef,
      rootRef,
    })

    // toArrayBuffer 内部只读 ref（sourceBytes / pdf 镜像），首渲染闭包永久有效
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ toArrayBuffer }), [])

    return (
      <div
        {...rest}
        ref={rootRef}
        className={[pdfEditorBase.root, className].filter(Boolean).join(' ')}
        tabIndex={0}
        onKeyDown={onKeydown}
      >
        {showHeader ? (
          <div className={pdfEditorBase.toolbar}>
            <span className={pdfEditorBase.pageLabel}>{pageLabel}</span>
            {error ? <span className={pdfEditorBase.statusError}>{error}</span> : null}
            <div className={pdfEditorBase.actions}>
              <button type="button" className={pdfEditorBase.action} onClick={() => zoomBy(1 / 1.15)}>
                {texts.zoomOut}
              </button>
              <button type="button" className={pdfEditorBase.action} onClick={() => zoomBy(1.15)}>
                {texts.zoomIn}
              </button>
              {!previewing ? (
                <>
                  <button type="button" className={pdfEditorBase.action} onClick={addNote}>
                    {texts.addText}
                  </button>
                  <button type="button" className={pdfEditorBase.action} onClick={rotateSelected}>
                    {texts.rotate}
                  </button>
                  <button type="button" className={pdfEditorBase.action} onClick={duplicateSelected}>
                    {texts.duplicatePage}
                  </button>
                  <button type="button" className={pdfEditorBase.action} onClick={addBlankAfter}>
                    {texts.addPage}
                  </button>
                  <button
                    type="button"
                    className={pdfEditorBase.action}
                    disabled={pdf.pages.length < 2}
                    onClick={deleteSelected}
                  >
                    {texts.deletePage}
                  </button>
                  <button
                    type="button"
                    className={pdfEditorBase.action}
                    disabled={selected <= 0}
                    onClick={() => moveSelected(-1)}
                  >
                    {texts.moveUp}
                  </button>
                  <button
                    type="button"
                    className={pdfEditorBase.action}
                    disabled={selected >= pdf.pages.length - 1}
                    onClick={() => moveSelected(1)}
                  >
                    {texts.moveDown}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : error ? (
          <div className={pdfEditorBase.toolbar}>
            <span className={pdfEditorBase.statusError}>{error}</span>
          </div>
        ) : null}
        <div className={pdfEditorBase.stage}>
          <CwDiv ref={stageRef} className="h-full" persistScrollbar onScroll={onScroll}>
            <div
              className={pdfEditorBase.stack}
              style={{ width: `${pageWidth}px`, height: `${totalHeight}px` }}
            >
              {visibleSlots.map((slot) => (
                <div
                  key={slot.index}
                  className={[
                    pdfEditorBase.page,
                    slot.index === selected ? pdfEditorBase.pageSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ top: `${slot.top}px`, height: `${slot.height}px` }}
                  onClick={() => setSelected(slot.index)}
                >
                  <canvas data-pdf-page={slot.index} className="block h-full w-full" />
                  {visibleRuns(slot.index).map((run) => (
                    <div
                      key={run.id}
                      className={[
                        pdfEditorBase.run,
                        editingRunId !== run.id ? pdfEditorBase.runHover : '',
                        editingRunId === run.id ? pdfEditorBase.runEdited : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={runStyle(slot.index, run, slot.height)}
                      data-pdf-run={run.id}
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        onRunPointerDown(slot.index, run, event)
                      }}
                      onMouseDown={onRunMouseDown}
                    >
                      {!previewing && editingRunId === run.id ? (
                        <div
                          ref={(element) => mountRunEditor(run, element)}
                          contentEditable="plaintext-only"
                          suppressContentEditableWarning
                          spellCheck={false}
                          className={pdfEditorBase.runInput}
                          data-placeholder={run.decodeFailed ? texts.runDecodePlaceholder : undefined}
                          style={runEditorStyle()}
                          onPointerDown={(event) => event.stopPropagation()}
                          onKeyDown={onRunKeydown}
                          onPaste={onRunPaste}
                          onBlur={(event) => onRunBlur(slot.index, run.id, event)}
                          onInput={(event) => onRunInput(slot.index, run.id, event)}
                        />
                      ) : null}
                    </div>
                  ))}
                  {(pdf.pages[slot.index]?.notes ?? []).map((note) => (
                    <div
                      key={note.id}
                      className={pdfEditorBase.note}
                      style={noteStyle(note, slot.height)}
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        onNotePointerDown(slot.index, note, event)
                      }}
                    >
                      {!previewing ? (
                        <textarea
                          className={pdfEditorBase.noteInput}
                          style={{ fontSize: `${noteFontPx(note, slot.height)}px` }}
                          value={note.text}
                          onKeyDown={(event) => event.stopPropagation()}
                          onChange={(event) => onNoteInput(slot.index, note.id, event.target.value)}
                        />
                      ) : (
                        <div
                          className={pdfEditorBase.noteInput}
                          style={{ fontSize: `${noteFontPx(note, slot.height)}px` }}
                        >
                          {note.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CwDiv>
          {loading ? (
            <div className={pdfEditorBase.loading}>
              <CwLoading type="spinner" size="small" />
              <span className={pdfEditorBase.loadingText}>{texts.loadingText}</span>
            </div>
          ) : null}
        </div>
      </div>
    )
  },
)

export default CwPdfEditor
