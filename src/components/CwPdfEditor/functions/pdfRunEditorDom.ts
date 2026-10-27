import type { CwPdfTextRun } from '@zengchaowu/ui-shared/components/CwPdfEditor/types'
import { readRunEditorText } from './pdfDocument'

export function queryRunEditor(stage: ParentNode | null | undefined, runId: string) {
  const editor = stage?.querySelector(`[data-pdf-run="${runId}"] [contenteditable]`)
  return editor instanceof HTMLElement ? editor : null
}

export function isRunEditorTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.isContentEditable
}

export function selectAllInRunEditor(editor: HTMLElement) {
  const selection = editor.ownerDocument.getSelection()
  if (!selection) return
  const range = editor.ownerDocument.createRange()
  range.selectNodeContents(editor)
  selection.removeAllRanges()
  selection.addRange(range)
}

function resolveMountElement(element: unknown) {
  if (element instanceof HTMLElement) return element
  if (element && typeof element === 'object' && '$el' in element && element.$el instanceof HTMLElement) {
    return element.$el
  }
  return null
}

export function mountRunEditorContent(run: CwPdfTextRun, element: unknown) {
  const target = resolveMountElement(element)
  if (!target) return
  if (target.dataset.pdfRunEditor === run.id) return
  target.dataset.pdfRunEditor = run.id
  target.textContent = run.text
}

export function pastePlainTextIntoEditor(event: ClipboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  const text = event.clipboardData?.getData('text/plain') ?? ''
  if (!text) return
  const editor = event.target
  if (!(editor instanceof HTMLElement)) return
  editor.ownerDocument.execCommand('insertText', false, text.replace(/\n/g, ''))
}

export function syncRunEditorDom(editor: HTMLElement) {
  const value = readRunEditorText(editor)
  if (editor.textContent !== value) editor.textContent = value
  return value
}
