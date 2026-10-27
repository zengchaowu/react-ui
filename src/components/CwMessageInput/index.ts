export { default as CwMessageInput } from './CwMessageInput'
export type { CwMessageInputComponentProps } from './CwMessageInput'
export * from './types'
export type * from '@zengchaowu/ui-shared/components/CwMessageInput/types'
export type {
  CwImMentionProfile,
  CwImMentionProfileResolver,
  CwImMentionProfileClickPayload,
} from '@zengchaowu/ui-shared/components/CwMessageInput/chips/mentionProfile.types'
export { FileRefNode, type FileRefNodeOptions } from './extensions/FileRefNode'
export { ImageClipNode, type ImageClipNodeOptions } from './extensions/ImageClipNode'
export { ImMentionNode, type ImMentionNodeOptions } from './extensions/ImMentionNode'
export { resolveDroppedFilePath } from '@zengchaowu/ui-shared/components/CwMessageInput/functions/resolveDroppedFilePath'
export {
  CwMessageInputInlineChip,
  fileRefExtensionFromPath,
  FILE_CHIP_WRAP_CLASS,
  FILE_CHIP_INNER_CLASS,
  INLINE_CHIP_LAYOUT_CLASS,
  INLINE_CHIP_ICON_IMG_CLASS,
  INLINE_CHIP_ICON_FALLBACK_CLASS,
  INLINE_CHIP_CLOSE_BTN_CLASS,
  USER_MENTION_WRAP_CLASS,
  USER_MENTION_INNER_CLASS,
} from './chips'
