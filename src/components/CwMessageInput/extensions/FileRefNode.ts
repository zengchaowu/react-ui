import {
  IM_RICH_FILE_ATTR,
  IM_RICH_FILE_LINES_ATTR,
  IM_RICH_FILE_PATH_ATTR,
  IM_RICH_LABEL_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import {
  fileIconNameForPath,
  fileIconUrl,
  type FileIconMaps,
} from '@zengchaowu/shared/functions/file/fileIcon'
import iconMaps from '../../../assets/materialFileIconMaps.json'
import { basenameFromFilePath } from '../../CwChatMessageCell/chatInlineContentClip'
import {
  FILE_CHIP_INNER_CLASS,
  FILE_CHIP_LABEL_CLASS,
  FILE_CHIP_WRAP_CLASS,
  INLINE_CHIP_CLOSE_ICON_CLASS,
  INLINE_CHIP_LEADING_WRAP_CLASS,
} from '../chips/chipStyles'
import {
  defineCwMessageInputInlineNode,
  type CwMessageInputInlineNodeDefinition,
} from './createNode'

export interface FileRefNodeOptions {
  /** 点击关闭按钮时触发 */
  onRemove?: (payload: { id: string; attachKey?: string }) => void
  removeAriaLabel?: string
}

export interface FileRefNodeAttrs {
  id?: string
  path?: string
  label?: string
  lines?: string
  attachKey?: string
}

const CLOSE_ICON_ROOT_CLASS = 'cw-icon inline-flex items-center justify-center text-current'
const CLOSE_ICON_ASSET_CLASS = 'icon-common--status--close-line asset inline-block not-italic leading-none text-current'

function createCloseIcon(): HTMLSpanElement {
  const root = document.createElement('span')
  root.className = CLOSE_ICON_ROOT_CLASS
  root.setAttribute('aria-hidden', 'true')
  const icon = document.createElement('i')
  icon.className = CLOSE_ICON_ASSET_CLASS
  icon.style.fontSize = 'inherit'
  root.appendChild(icon)
  return root
}

function createFileIcon(path: string, baseUrl: string): HTMLSpanElement {
  const root = document.createElement('span')
  root.className =
    'cw-file-icon inline-flex items-center justify-center shrink-0 select-none h-full w-full'
  const img = document.createElement('img')
  const iconName = fileIconNameForPath(
    iconMaps as FileIconMaps,
    path,
    false,
  )
  img.src = fileIconUrl(iconName, baseUrl || '/')
  img.alt = ''
  img.draggable = false
  img.className = 'block h-full w-full object-contain [image-rendering:-webkit-optimize-contrast]'
  root.appendChild(img)
  return root
}

/** 构造文件引用 chip DOM（等价 Vue `FileRefChipNodeView`） */
export function createFileRefElement(
  attrs: FileRefNodeAttrs,
  options: FileRefNodeOptions,
  baseUrl: string,
): HTMLSpanElement {
  const id = String(attrs.id ?? '')
  const path = String(attrs.path ?? '')
  const lines = String(attrs.lines ?? '').trim()
  const label =
    String(attrs.label ?? '').trim() || basenameFromFilePath(path, path) || 'file'

  const wrap = document.createElement('span')
  wrap.className = FILE_CHIP_WRAP_CLASS
  wrap.setAttribute('data-cw-file-ref-wrap', '')
  wrap.setAttribute('contenteditable', 'false')

  const chip = document.createElement('span')
  chip.className = FILE_CHIP_INNER_CLASS
  chip.setAttribute('data-cw-file', '')
  chip.setAttribute(IM_RICH_FILE_ATTR, '')
  chip.setAttribute(IM_RICH_FILE_PATH_ATTR, path)
  chip.setAttribute(IM_RICH_LABEL_ATTR, label)
  if (lines) chip.setAttribute(IM_RICH_FILE_LINES_ATTR, lines)
  chip.setAttribute('data-file-ref', id)
  chip.setAttribute('data-file-path', path)
  if (lines) chip.setAttribute('data-file-lines', lines)
  if (attrs.attachKey) chip.setAttribute('data-attach-key', attrs.attachKey)
  chip.title = path

  const leading = document.createElement('span')
  leading.className = INLINE_CHIP_LEADING_WRAP_CLASS
  leading.appendChild(createFileIcon(path, baseUrl))
  chip.appendChild(leading)

  const labelEl = document.createElement('span')
  labelEl.className = `${FILE_CHIP_LABEL_CLASS} truncate`
  labelEl.title = label.trim() || path
  labelEl.textContent = label
  chip.appendChild(labelEl)

  const close = document.createElement('span')
  close.className = INLINE_CHIP_CLOSE_ICON_CLASS
  close.setAttribute('role', 'button')
  close.setAttribute('tabindex', '-1')
  close.setAttribute('aria-label', options.removeAriaLabel ?? '移除引用')
  close.setAttribute('data-chip-close', 'fileRef')
  close.appendChild(createCloseIcon())
  chip.appendChild(close)

  wrap.appendChild(chip)
  return wrap
}

export function renderFileRefHtml(attrs: FileRefNodeAttrs): string {
  const path = String(attrs.path ?? '').trim()
  const label =
    String(attrs.label ?? '').trim() || path.split(/[/\\]/).pop() || path || 'file'
  const lines = String(attrs.lines ?? '').trim()
  return `<span ${IM_RICH_FILE_ATTR} ${IM_RICH_FILE_PATH_ATTR}="${path}" ${IM_RICH_LABEL_ATTR}="${label}"${
    lines ? ` ${IM_RICH_FILE_LINES_ATTR}="${lines}"` : ''
  }>${label}</span>`
}

export function renderFileRefText(attrs: FileRefNodeAttrs): string {
  const label =
    String(attrs.label ?? '').trim() || String(attrs.path ?? '').trim()
  return label ? `[文件] ${label}` : '[文件]'
}

/**
 * 文件引用节点描述。React 侧无 Tiptap schema，实际 DOM 由
 * {@link createFileRefElement} / {@link renderFileRefHtml} 交给编辑器生成。
 */
export const FileRefNode: CwMessageInputInlineNodeDefinition<FileRefNodeOptions> =
  defineCwMessageInputInlineNode<FileRefNodeOptions>('fileRef', {
    onRemove: undefined,
    removeAriaLabel: '移除引用',
  })
