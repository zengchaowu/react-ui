import type { Meta, StoryObj } from '@storybook/react'
import { CwContextMenu } from './CwContextMenu'
import { showCwContextMenu } from './showCwContextMenu'

const demoItems = [
  { key: 'copy', label: '复制', shortcut: 'Ctrl C' },
  { key: 'rename', label: '重命名', shortcut: 'F2' },
  { key: 'delete', label: '删除', danger: true, dividerAfter: true },
  {
    key: 'more',
    label: '更多',
    children: [
      { key: 'export', label: '导出' },
      { key: 'share', label: '分享' },
    ],
  },
]

const meta: Meta<typeof CwContextMenu> = {
  title: '1. Components/Overlay/CwContextMenu',
  component: CwContextMenu,
}

export default meta
type Story = StoryObj<typeof CwContextMenu>

export const Default: Story = {
  render: () => (
    <div
      className="flex min-h-[10rem] w-[22.5rem] cursor-context-menu items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] text-sm text-[var(--text-color-secondary)] select-none"
      onContextMenu={(event) => {
        event.preventDefault()
        showCwContextMenu({
          x: event.clientX,
          y: event.clientY,
          items: demoItems,
          appearance: 'glass-frosted',
        })
      }}
    >
      在此区域右键打开菜单
    </div>
  ),
}
