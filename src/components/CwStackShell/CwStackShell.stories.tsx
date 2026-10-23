import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwStackShell } from './CwStackShell'
import type { CwStackShellMode } from './types'

const phoneFrameClass =
  'mx-auto flex h-[32rem] w-[24rem] max-w-[min(100%,24rem)] flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-page)]'

function ShellDemo() {
  const [stack, setStack] = useState<CwStackShellMode>('list')

  return (
    <div className={phoneFrameClass}>
      <CwStackShell
        stack={stack}
        slideTransition
        className="min-h-0 min-w-0 w-full flex-1"
        listSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <div className="shrink-0 px-4 py-3 text-base font-semibold text-[var(--text-color-primary)]">
              会话列表
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <button
                type="button"
                className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-[var(--bg-color-secondarycontainer)] px-3 py-3 text-left transition-colors hover:bg-[var(--bg-color-component-hover)]"
                onClick={() => setStack('detail')}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-color-6)] text-sm text-[var(--text-color-anti)]">
                  A
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--text-color-primary)]">Alice</span>
                  <span className="block truncate text-xs text-[var(--text-color-secondary)]">点击进入聊天</span>
                </span>
              </button>
            </div>
          </div>
        }
        detailSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <div className="shrink-0 px-4 py-3 text-base font-semibold text-[var(--text-color-primary)]">
              Alice
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-[var(--text-color-secondary)]">
              当前 stack={stack}，横向 push/pop 转场
            </div>
            <div className="shrink-0 p-3">
              <button
                type="button"
                className="w-full cursor-pointer rounded-lg border-0 bg-[var(--brand-color-6)] px-3 py-2 text-sm text-[var(--text-color-anti)]"
                onClick={() => setStack('list')}
              >
                返回列表
              </button>
            </div>
          </div>
        }
      />
    </div>
  )
}

const meta: Meta<typeof CwStackShell> = {
  title: '1. Components/Layout/CwStackShell',
  component: CwStackShell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'list/detail 栈导航壳：基于 CwStack 固定 list（根层）与 detail（push 层）。stack="list" 显示列表，stack="detail" 滑入详情。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stack: {
      control: { type: 'select' },
      options: ['list', 'detail'],
      description: 'list=仅列表层；detail=push 详情层',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stack: 'list',
    slideTransition: true,
  },
  render: () => <ShellDemo />,
}

export const ListOnly: Story = {
  render: () => (
    <div className={phoneFrameClass}>
      <CwStackShell
        stack="list"
        className="min-h-0 min-w-0 w-full flex-1"
        listSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <div className="shrink-0 px-4 py-3 text-base font-semibold text-[var(--text-color-primary)]">
              列表层
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-[var(--text-color-secondary)]">
              stack=list 时只显示这一层。detail 已注册但不会露出。
            </div>
          </div>
        }
        detailSlot={
          <div className="p-4 text-sm text-[var(--text-color-secondary)]">详情层（当前不可见）</div>
        }
      />
    </div>
  ),
}
