import type { CwChatToolbarItemConfig } from '../components/CwChatToolbar/types'

/** Storybook 演示用 IM 工具栏项（不含钱包/通话等产品扩展） */
export const storybookChatToolbarDemoItems: CwChatToolbarItemConfig[] = [
  { key: 'emoji', label: '表情', icon: 'chat--msg--emoji-line', action: { type: 'emit' } },
  {
    key: 'file',
    label: '文件',
    icon: 'common--nav--file-line',
    action: { type: 'open-file-picker', accept: '*/*' },
  },
  { key: 'capture', label: '截图', icon: 'common--media--camera-line', action: { type: 'emit' } },
  {
    key: 'image',
    label: '图片与视频',
    icon: 'common--media--image-line',
    action: { type: 'open-file-picker', accept: 'image/*,video/*' },
  },
  { key: 'records', label: '聊天记录', icon: 'common--nav--history-line', action: { type: 'emit' } },
]

export const storybookChatMobileMoreDemoItems = storybookChatToolbarDemoItems
  .filter(
    (item): item is typeof item & { icon: string } =>
      (item.key === 'file' || item.key === 'image') && typeof item.icon === 'string',
  )
  .map(({ key, label, icon }) => ({ key, label, icon }))
