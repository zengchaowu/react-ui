import type { Editor } from '@tiptap/core'

type FocusPosition = 'start' | 'end' | number | boolean

function editorDom(editor: Editor): HTMLElement {
  return editor.view.dom as HTMLElement
}

/** 同步 ProseMirror 根节点的 virtualKeyboardPolicy（Chromium / 新版 WebView）。 */
export function syncEditorVirtualKeyboardPolicy(
  editor: Editor | null | undefined,
  suppress: boolean,
): void {
  if (!editor) return
  const dom = editorDom(editor)
  if ('virtualKeyboardPolicy' in dom) {
    ;(dom as HTMLElement & { virtualKeyboardPolicy: string }).virtualKeyboardPolicy =
      suppress ? 'manual' : 'auto'
  }
}

/**
 * 聚焦编辑器；suppressKeyboard 时尽量不唤起系统输入法（仍尽量保留选区/光标）。
 * - 优先 virtualKeyboardPolicy=manual
 * - iOS 等降级：只读属性瞬时切换
 */
export function focusEditorWithKeyboardPolicy(
  editor: Editor,
  suppressKeyboard: boolean,
  /** 不传则保持当前选区；勿默认 `true`，避免误把光标移到文首 */
  position?: FocusPosition,
): void {
  const dom = editorDom(editor)
  const focusChain =
    position === undefined ? editor.chain().focus() : editor.chain().focus(position)
  if (!suppressKeyboard) {
    syncEditorVirtualKeyboardPolicy(editor, false)
    focusChain.run()
    return
  }

  syncEditorVirtualKeyboardPolicy(editor, true)

  if ('virtualKeyboardPolicy' in dom) {
    focusChain.run()
    return
  }

  dom.setAttribute('readonly', 'true')
  dom.setAttribute('inputmode', 'none')
  focusChain.run()
  requestAnimationFrame(() => {
    dom.removeAttribute('readonly')
    dom.removeAttribute('inputmode')
  })
}
