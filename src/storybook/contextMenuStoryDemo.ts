import { showCwContextMenu } from '../components/CwContextMenu/showCwContextMenu'
import type { CwContextMenuItem, CwContextMenuLayout } from '../components/CwContextMenu/types'
import type { CwContextMenuAppearance } from '@zengchaowu/ui-shared/components/CwContextMenu/types'
import type { Placement } from '@zengchaowu/shared/types/placement'

export interface OpenContextMenuStoryOptions {
  event: MouseEvent
  items: CwContextMenuItem[]
  appearance?: CwContextMenuAppearance
  layout?: CwContextMenuLayout
  placement?: Placement
  anchorRect?: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>
  anchorOffset?: number
  onSelect?: (key: string) => void
}

/** Story 演示：在 pointer / anchor 位置打开命令式右键菜单 */
export function openContextMenuStoryDemo(options: OpenContextMenuStoryOptions) {
  showCwContextMenu({
    x: options.event.clientX,
    y: options.event.clientY,
    items: options.items,
    appearance: options.appearance,
    layout: options.layout,
    placement: options.placement,
    anchorRect: options.anchorRect,
    anchorOffset: options.anchorOffset,
    onSelect: options.onSelect,
  })
}

export const demoAttachContextMenuItems: CwContextMenuItem[] = [
  { key: 'open', label: '打开' },
  { key: 'download', label: '下载' },
  { key: 'delete', label: '删除', danger: true },
]

export const demoMessageToolbarItems: CwContextMenuItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'quote', label: '引用' },
  { key: 'forward', label: '转发' },
]

export const demoDefaultContextMenuItems: CwContextMenuItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'forward', label: '转发' },
  { key: 'delete', label: '删除', danger: true },
]

export const demoDesktopContextMenuItems: CwContextMenuItem[] = [
  { key: 'new-folder', label: '新建文件夹', icon: 'common--action--group-line' },
  { key: 'upload', label: '上传', icon: 'common--action--upload-line', dividerAfter: true },
  { key: 'wallpaper', label: '更换壁纸', icon: 'common--media--image-line' },
  { key: 'clean', label: '整理桌面', icon: 'common--action--arrange-line' },
]
