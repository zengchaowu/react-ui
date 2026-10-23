/** 可输入控件：排除隐藏、勾选类与禁用控件，避免聚焦到不可输入的元素 */
const OVERLAY_AUTOFOCUS_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
].join(', ')

/** 选中可编辑区域内的全部内容（contenteditable 不支持 select） */
function selectEditableContent(target: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(target)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 聚焦浮层内容区内的第一个输入控件并选中其内容。
 * 供 `config.autofocus` 使用：新建 / 重命名等弹窗打开后可直接输入，
 * 带初始值时直接覆盖而不是追加。
 */
export function focusOverlayFirstField(
  root: ParentNode | null | undefined,
): boolean {
  if (!root) return false
  const target = root.querySelector<HTMLElement>(OVERLAY_AUTOFOCUS_SELECTOR)
  if (!target) return false
  target.focus()
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.select()
  } else if (target.isContentEditable) {
    selectEditableContent(target)
  }
  return true
}
