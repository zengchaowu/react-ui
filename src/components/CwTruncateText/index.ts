export { default as CwTruncateText } from './CwTruncateText'
export { defaultCwTruncateTextTexts } from '@zengchaowu/ui-shared/components/CwTruncateText/texts'
export * from './types'
export type * from '@zengchaowu/ui-shared/components/CwTruncateText/types'
export { truncateTextBase } from './styles'
export { truncateKeepEnd } from '@zengchaowu/ui-shared/components/CwTruncateText/functions/truncateKeepEnd'
export {
  buildFilenameDisplayCandidates,
  resolveFilenameDisplay,
  splitFilenameExtension,
  truncateFilenameHeadExt,
} from '@zengchaowu/ui-shared/components/CwTruncateText/functions/resolveFilenameDisplay'
export type {
  FilenameDisplayOptions,
  FilenameDisplayResolution,
} from '@zengchaowu/ui-shared/components/CwTruncateText/functions/resolveFilenameDisplay'
export { useFilenameTruncateLayout } from './hooks/useFilenameTruncateLayout'
