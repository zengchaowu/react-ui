import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CwLoading } from '../CwLoading'
import CwDocxParagraphBlock from './CwDocxParagraphBlock'
import CwDocxTableBlock from './CwDocxTableBlock'
import { docxEditorBase } from '@zengchaowu/ui-shared/components/CwDocxEditor/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDocxEditor/texts'
import type { CwDocxEditorHandle, CwDocxEditorProps } from './types'
import type { CwDocxDocument, CwDocxParagraph, CwDocxRun } from '@zengchaowu/ui-shared/components/CwDocxEditor/types'
import {
  cloneDocument,
  createBlankDocument,
  documentToArrayBuffer,
  paragraph,
  parseDocx,
  readDocxSource,
  sameDocument,
} from '@zengchaowu/ui-shared/components/CwDocxEditor/functions/docx'
import { listLabelsForBlocks } from '@zengchaowu/ui-shared/components/CwDocxEditor/functions/listNumbering'

export const CwDocxEditor = forwardRef<CwDocxEditorHandle, CwDocxEditorProps>(
  function CwDocxEditor(
    {
      modelValue,
      src = null,
      mode = 'edit',
      readonly = false,
      texts: textsProp,
      className,
      onModelValueChange,
      onChange,
      ...rest
    },
    ref,
  ) {
    const texts = { ...defaultTexts, ...(textsProp ?? {}) }
    const previewing = mode === 'preview' || readonly

    const [doc, setDoc] = useState<CwDocxDocument>(() =>
      modelValue ? cloneDocument(modelValue) : createBlankDocument(),
    )
    const [loading, setLoading] = useState(src != null && modelValue == null)
    const [error, setError] = useState('')

    // 段落 run 编辑走原地变更（contenteditable 自己持有 DOM），用 ref 保证始终拿到最新文档
    const docRef = useRef(doc)
    useEffect(() => {
      docRef.current = doc
    }, [doc])

    const textsRef = useRef(texts)
    useEffect(() => {
      textsRef.current = texts
    })

    const listLabels = useMemo(
      () => listLabelsForBlocks(doc.blocks, doc.numberingXml),
      [doc],
    )

    function paragraphClass(block: CwDocxParagraph) {
      const level =
        block.level >= 3
          ? docxEditorBase.heading3
          : block.level === 2
            ? docxEditorBase.heading2
            : block.level === 1
              ? docxEditorBase.heading1
              : docxEditorBase.paragraph
      return [level]
    }

    function publish() {
      const next = cloneDocument(docRef.current)
      onModelValueChange?.(next)
      onChange?.(next)
    }

    function patch(change: (document: CwDocxDocument) => void) {
      const next = cloneDocument(docRef.current)
      change(next)
      docRef.current = next
      setDoc(next)
      publish()
    }

    function addParagraph() {
      patch((next) => {
        next.blocks.push(paragraph(''))
      })
    }

    function onParagraphRuns(block: CwDocxParagraph, runs: CwDocxRun[]) {
      if (JSON.stringify(block.runs) === JSON.stringify(runs)) return
      block.runs = runs
      publish()
    }

    async function loadSource(source: NonNullable<CwDocxEditorProps['src']>) {
      setLoading(true)
      setError('')
      try {
        const next = await parseDocx(await readDocxSource(source))
        docRef.current = next
        setDoc(next)
      } catch {
        setError(textsRef.current.loadError)
        const empty: CwDocxDocument = { blocks: [] }
        docRef.current = empty
        setDoc(empty)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      if (src == null) return
      void loadSource(src)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    useEffect(() => {
      if (!modelValue || sameDocument(modelValue, docRef.current)) return
      const next = cloneDocument(modelValue)
      docRef.current = next
      setDoc(next)
    }, [modelValue])

    useImperativeHandle(
      ref,
      () => ({
        async toArrayBuffer() {
          return documentToArrayBuffer(docRef.current)
        },
      }),
      [],
    )

    return (
      <div {...rest} className={[docxEditorBase.root, className].filter(Boolean).join(' ')}>
        <div className={docxEditorBase.toolbar}>
          {error ? <span className={docxEditorBase.statusError}>{error}</span> : null}
          <div className={docxEditorBase.actions}>
            {!previewing ? (
              <button type="button" className={docxEditorBase.action} onClick={addParagraph}>
                {texts.addParagraph}
              </button>
            ) : null}
          </div>
        </div>
        <div className={docxEditorBase.stage}>
          {loading ? (
            <div className={docxEditorBase.loading}>
              <CwLoading type="spinner" size="small" />
              <span className={docxEditorBase.loadingText}>{texts.loadingText}</span>
            </div>
          ) : (
            <article className={docxEditorBase.page}>
              {doc.blocks.map((block) => {
                if (block.kind === 'image') {
                  return <img key={block.id} className={docxEditorBase.image} src={block.dataUrl} alt="" />
                }
                if (block.kind === 'table') {
                  return (
                    <CwDocxTableBlock
                      key={block.id}
                      block={block}
                      editable={!previewing}
                      onChange={publish}
                    />
                  )
                }
                return (
                  <CwDocxParagraphBlock
                    key={block.id}
                    block={block}
                    editable={!previewing}
                    wrapperClass={paragraphClass(block)}
                    listLabel={listLabels.get(block.id)}
                    onUpdateRuns={(runs) => onParagraphRuns(block, runs)}
                  />
                )
              })}
            </article>
          )}
        </div>
      </div>
    )
  },
)

export default CwDocxEditor
