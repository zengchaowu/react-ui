import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  demoAttachContextMenuItems,
  demoDefaultContextMenuItems,
  demoDesktopContextMenuItems,
  demoMessageToolbarItems,
  openContextMenuStoryDemo,
} from '../../storybook/contextMenuStoryDemo'
import { showCwContextMenu } from './showCwContextMenu'
import type { CwContextMenuAppearance } from './types'

type ContextMenuPlaygroundArgs = {
  appearance: CwContextMenuAppearance
  shadow: boolean
  viewportPadding: number
}

const meta: Meta<ContextMenuPlaygroundArgs> = {
  title: '1. Components/Overlay/CwContextMenu',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '命令式右键菜单：`showCwContextMenu(options)` 在 pointer 位置弹出。纵向列表默认 `glass-frosted`（`compact` 同款）；另有 `default` / `toolbar` / `plain` / `checklist`。Story 请在演示区域右键触发。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: {
      control: { type: 'select' },
      options: ['default', 'compact', 'toolbar', 'glass-frosted', 'plain', 'checklist'],
    },
    shadow: { control: { type: 'boolean' } },
    viewportPadding: { control: { type: 'number', min: 0, step: 4 } },
  },
  args: {
    appearance: 'glass-frosted',
    shadow: true,
    viewportPadding: 8,
  },
}

export default meta
type Story = StoryObj<ContextMenuPlaygroundArgs>

export const Default: Story = {
  name: 'glass-frosted',
  render: (args) => {
    const [lastKey, setLastKey] = useState('')
    return (
      <div className="flex w-[22.5rem] flex-col items-stretch gap-3 p-4">
        <p className="text-xs text-[var(--text-color-secondary)]">Controls 影响下次右键打开的菜单</p>
        <div
          className="flex min-h-[10rem] cursor-context-menu items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[color-mix(in_srgb,var(--brand-color-6)_8%,var(--bg-color-container))] px-4 text-center text-sm text-[var(--text-color-secondary)] select-none"
          onContextMenu={(event) => {
            event.preventDefault()
            showCwContextMenu({
              x: event.clientX,
              y: event.clientY,
              items: demoDesktopContextMenuItems,
              appearance: args.appearance,
              shadow: args.shadow,
              viewportPadding: args.viewportPadding,
              onSelect: (key) => setLastKey(key),
            })
          }}
        >
          在此区域右键打开菜单
        </div>
        {lastKey ? (
          <p className="text-sm text-[var(--text-color-secondary)]">已选择：{lastKey}</p>
        ) : null}
      </div>
    )
  },
}

export const AttachmentGlass: Story = {
  name: 'glass-frosted / attachment',
  render: (args) => {
    const [lastKey, setLastKey] = useState('')
    return (
      <div className="flex w-[22.5rem] flex-col items-stretch gap-3 p-4">
        <div
          className="flex cursor-context-menu items-center gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] px-3 py-2.5 select-none"
          onContextMenu={(event) => {
            event.preventDefault()
            openContextMenuStoryDemo({
              event: event.nativeEvent,
              items: demoAttachContextMenuItems,
              appearance: args.appearance ?? 'glass-frosted',
              onSelect: (key) => setLastKey(key),
            })
          }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--bg-color-component)] text-xs font-medium text-[var(--text-color-secondary)]">
            PDF
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-[var(--text-color-primary)]">项目方案.pdf</div>
            <div className="text-xs text-[var(--text-color-secondary)]">2.4 MB · 右键打开菜单</div>
          </div>
        </div>
        {lastKey ? (
          <p className="text-sm text-[var(--text-color-secondary)]">选中: {lastKey}</p>
        ) : null}
      </div>
    )
  },
}

export const SolidDefault: Story = {
  name: 'default',
  args: {
    appearance: 'default',
  },
  render: (args) => {
    const [lastKey, setLastKey] = useState('')
    return (
      <div className="flex w-[22.5rem] flex-col items-stretch gap-3 p-4">
        <div
          className="flex min-h-[8rem] cursor-context-menu items-center justify-center rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-container)] px-4 text-center text-sm text-[var(--text-color-secondary)] select-none"
          onContextMenu={(event) => {
            event.preventDefault()
            openContextMenuStoryDemo({
              event: event.nativeEvent,
              items: demoDefaultContextMenuItems,
              appearance: args.appearance,
              onSelect: (key) => setLastKey(key),
            })
          }}
        >
          在此区域单击右键打开菜单
        </div>
        {lastKey ? (
          <p className="text-sm text-[var(--text-color-secondary)]">已选择：{lastKey}</p>
        ) : null}
      </div>
    )
  },
}

export const MessageToolbar: Story = {
  name: 'toolbar',
  args: {
    appearance: 'toolbar',
  },
  render: (args) => {
    const [lastKey, setLastKey] = useState('')
    return (
      <div className="flex w-[22.5rem] flex-col items-stretch gap-3 p-4">
        <div
          className="max-w-[16rem] cursor-context-menu self-start rounded-lg bg-[var(--bg-color-secondarycontainer)] px-3 py-2 text-sm leading-relaxed text-[var(--text-color-primary)] select-none"
          onContextMenu={(event) => {
            event.preventDefault()
            const target = event.currentTarget
            const rect = target.getBoundingClientRect()
            openContextMenuStoryDemo({
              event: event.nativeEvent,
              items: demoMessageToolbarItems,
              appearance: args.appearance ?? 'toolbar',
              layout: 'toolbar',
              placement: 'top',
              anchorRect: rect,
              anchorOffset: 8,
              onSelect: (key) => setLastKey(key),
            })
          }}
        >
          这是一条消息气泡。在气泡上右键，会在上方弹出横排工具条（与 chat 移动端长按效果一致）。
        </div>
        <p className="text-xs text-[var(--text-color-placeholder)]">在消息气泡上单击右键</p>
        {lastKey ? (
          <p className="text-sm text-[var(--text-color-secondary)]">选中: {lastKey}</p>
        ) : null}
      </div>
    )
  },
}
