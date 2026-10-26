import { Node, mergeAttributes } from '@tiptap/core'
import {
  IM_RICH_FILE_ATTR,
  IM_RICH_FILE_PATH_ATTR,
  IM_RICH_FILE_LINES_ATTR,
  IM_RICH_LABEL_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { FileRefNodeView } from './FileRefNodeView'

export interface FileRefNodeOptions {
  /** 点击关闭按钮时触发 */
  onRemove?: (payload: { id: string; attachKey?: string }) => void
  removeAriaLabel?: string
}

function attrsFromFileRefEl(el: HTMLElement) {
  const id = el.getAttribute('data-file-ref') || ''
  const path = el.getAttribute('data-file-path') || ''
  const lines = el.getAttribute('data-file-lines') || undefined
  const attachKey = el.getAttribute('data-attach-key') || undefined
  const labelEl = el.querySelector('.cw-file-ref-label')
  const label =
    (labelEl?.textContent?.trim() || path.split('/').pop() || path || '') as string
  return {
    id,
    path,
    label,
    lines: lines || undefined,
    attachKey: attachKey || undefined,
  }
}

/**
 * 文件引用：`CwMessageInputInlineChip` + `CwTooltip`（等价 Vue `FileRefNode`）。
 */
export const FileRefNode = Node.create<FileRefNodeOptions>({
  name: 'fileRef',

  group: 'inline',

  inline: true,

  selectable: true,

  draggable: false,

  atom: true,

  addOptions() {
    return {
      onRemove: undefined,
      removeAriaLabel: '移除引用',
    }
  },

  addAttributes() {
    return {
      id: { default: '' },
      path: { default: '' },
      label: { default: '' },
      lines: { default: undefined as string | undefined },
      attachKey: { default: undefined as string | undefined },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[${IM_RICH_FILE_ATTR}]`,
        getAttrs: (el) => {
          const path = (el as HTMLElement).getAttribute(IM_RICH_FILE_PATH_ATTR) || ''
          const label =
            (el as HTMLElement).getAttribute(IM_RICH_LABEL_ATTR)?.trim() ||
            (el as HTMLElement).textContent?.trim() ||
            path
          return {
            id: `ref_${Date.now()}`,
            path,
            label,
            lines:
              (el as HTMLElement).getAttribute(IM_RICH_FILE_LINES_ATTR)?.trim() ||
              undefined,
          }
        },
      },
      {
        tag: 'span[data-file-ref]',
        getAttrs: (el) => attrsFromFileRefEl(el as HTMLElement),
      },
      {
        tag: 'span[data-cw-file-ref-wrap]',
        getAttrs: (el) => {
          const inner = (el as HTMLElement).querySelector('[data-file-ref]')
          if (!inner) return false
          return attrsFromFileRefEl(inner as HTMLElement)
        },
      },
    ]
  },

  renderHTML({ node }) {
    const path = String(node.attrs.path ?? '').trim()
    const label =
      String(node.attrs.label ?? '').trim() ||
      path.split(/[/\\]/).pop() ||
      path ||
      'file'
    const lines = String(node.attrs.lines ?? '').trim()
    return [
      'span',
      mergeAttributes({
        [IM_RICH_FILE_ATTR]: '',
        [IM_RICH_FILE_PATH_ATTR]: path,
        [IM_RICH_LABEL_ATTR]: label,
        ...(lines ? { [IM_RICH_FILE_LINES_ATTR]: lines } : {}),
      }),
      label,
    ]
  },

  renderText({ node }) {
    const label =
      String(node.attrs.label ?? '').trim() || String(node.attrs.path ?? '').trim()
    return label ? `[文件] ${label}` : '[文件]'
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileRefNodeView)
  },
})
