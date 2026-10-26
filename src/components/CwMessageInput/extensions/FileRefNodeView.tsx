import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import CwTooltip from '../../CwTooltip/CwTooltip'
import CwFileIcon from '../../CwFileIcon/CwFileIcon'
import CwMessageInputInlineChip from '../chips/CwMessageInputInlineChip'
import {
  FILE_CHIP_INNER_CLASS,
  FILE_CHIP_WRAP_CLASS,
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
} from '../chips/chipStyles'
import {
  basenameFromFilePath,
  FILE_CHIP_CW_FILE_ICON_SIZE,
  FILE_CHIP_PATH_TOOLTIP_SHOW_DELAY,
} from '../../CwChatMessageCell/chatInlineContentClip'
import type { FileRefNodeOptions } from './FileRefNode'

/** 文件引用 chip 节点视图（等价 Vue `FileRefChipNodeView`） */
export function FileRefNodeView({
  node,
  extension,
  deleteNode,
}: NodeViewProps) {
  const opts = extension.options as FileRefNodeOptions
  const id = String(node.attrs.id ?? '')
  const path = String(node.attrs.path ?? '')
  const lines = node.attrs.lines as string | undefined
  const attachKey = node.attrs.attachKey as string | undefined
  const label = String(node.attrs.label ?? '').trim() || basenameFromFilePath(path, '')

  function onClose() {
    deleteNode()
    opts.onRemove?.({
      id,
      attachKey: attachKey ? String(attachKey) : undefined,
    })
  }

  const chip = (
    <CwMessageInputInlineChip
      innerClass={FILE_CHIP_INNER_CLASS}
      text={label}
      showLeadingIcon
      showClose
      closeAsIcon
      labelFilenameTruncate
      closeAriaLabel={opts.removeAriaLabel ?? '移除引用'}
      innerAttrs={{
        'data-file-ref': id,
        'data-file-path': path,
        ...(lines ? { 'data-file-lines': lines } : {}),
        ...(attachKey ? { 'data-attach-key': attachKey } : {}),
      }}
      leadingSlot={
        <CwFileIcon path={path} isDirectory={false} size={FILE_CHIP_CW_FILE_ICON_SIZE} />
      }
      onClose={onClose}
    />
  )

  const pathText = path.trim()

  return (
    <NodeViewWrapper
      as="span"
      className={FILE_CHIP_WRAP_CLASS}
      data-cw-file-ref-wrap=""
    >
      {pathText ? (
        <CwTooltip
          content={pathText}
          placement="top"
          showDelay={FILE_CHIP_PATH_TOOLTIP_SHOW_DELAY}
          appearance="inline"
          className={INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS}
          triggerSlot={chip}
        />
      ) : (
        chip
      )}
    </NodeViewWrapper>
  )
}

export default FileRefNodeView
