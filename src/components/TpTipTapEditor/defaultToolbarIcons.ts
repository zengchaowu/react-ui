import type { TpTipTapEditorToolbarIcons } from './types'

/** 默认工具栏 iconfont 图标名（与 vue-ui iconfont 一致，未配置的按钮显示文案） */
export const defaultToolbarIcons: Partial<TpTipTapEditorToolbarIcons> = {
  image: 'common--media--image-line',
  video: 'common--nav--history-line',
  undo: 'common--action--revert-line',
  redo: 'common--action--refresh-line',
  bulletList: 'common--commerce--list-view-line',
  orderedList: 'common--commerce--list-view-line',
  codeBlock: 'common--nav--file-line',
}
