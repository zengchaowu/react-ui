import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwNavBar } from '../CwNavBar/CwNavBar'
import { CW_NAV_BAR_ICON_BUTTON_CLASS } from '@zengchaowu/ui-shared/components/CwNavBar/styles'
import { CwButton } from '../CwButton/CwButton'
import { CwStackShell } from './CwStackShell'
import type { CwStackShellMode } from '@zengchaowu/ui-shared/components/CwStackShell/types'

const phoneFrameClass =
  'mx-auto flex h-[32rem] w-[24rem] max-w-[min(100%,24rem)] flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-page)]'

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
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
          'list/detail 栈导航壳：基于 `CwStack` 固定 `#list`（根层）与 `#detail`（push 层）。顶栏用 `CwNavBar`。`stack="list"` 显示列表，`stack="detail"` 滑入详情。',
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
    slideTransition: {
      control: 'boolean',
      description: '是否启用横向 push/pop 转场',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** 默认从列表层开始，点击会话 push 详情（推荐用法） */
export const Default: Story = {
  args: {
    stack: 'list',
    slideTransition: true,
  },
  render: (args) => <StackShellDemo args={args} />,
}

function StackShellDemo({ args }: { args: Story['args'] }) {
  const [stack, setStack] = useState<CwStackShellMode>(args?.stack ?? 'list')

  useEffect(() => {
    setStack(args?.stack ?? 'list')
  }, [args?.stack])

  return (
    <div className={phoneFrameClass}>
      <CwStackShell
        stack={stack}
        slideTransition={args?.slideTransition}
        className="min-h-0 min-w-0 w-full flex-1"
        listSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <CwNavBar title="会话列表" />
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
                  <span className="block truncate text-xs text-[var(--text-color-secondary)]">
                    点击进入聊天
                  </span>
                </span>
              </button>
            </div>
          </div>
        }
        detailSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <CwNavBar
              title="Alice"
              leftSlot={
                <button
                  type="button"
                  className={CW_NAV_BAR_ICON_BUTTON_CLASS}
                  aria-label="返回"
                  onClick={() => setStack('list')}
                >
                  <BackIcon />
                </button>
              }
            />
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-[var(--text-color-secondary)]">
              当前 stack={stack}，横向 push/pop 转场
            </div>
            <div className="shrink-0 border-t border-[var(--border-color)] p-3 hairline-border-t">
              <CwButton className="w-full" onClick={() => setStack('list')}>
                返回列表
              </CwButton>
            </div>
          </div>
        }
      />
      <p className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-color-container)] px-3 py-2 text-center text-xs text-[var(--text-color-secondary)] hairline-border-t">
        stack={stack} · 也可用 Controls 切换
      </p>
    </div>
  )
}

/** 初始停在列表层（stack=list），与 Default 相同但不可点进详情 — 仅展示根层 */
export const ListOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: '仅绑定 `stack="list"` 时的静态展示；实际业务中通常在选中项后改为 `detail`。',
      },
    },
  },
  render: () => (
    <div className={phoneFrameClass}>
      <CwStackShell
        stack="list"
        className="min-h-0 min-w-0 w-full flex-1"
        listSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <CwNavBar title="列表层 (#list)" />
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <p className="text-xs leading-relaxed text-[var(--text-color-secondary)]">
                stack=list 时只显示这一层。详情 slot 已注册但不会露出。
              </p>
              <p className="mt-3 text-xs text-[var(--text-color-placeholder)]">
                交互演示请看 Default Story
              </p>
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

function NestedDemo() {
  const [outer, setOuter] = useState<CwStackShellMode>('list')
  const [inner, setInner] = useState<CwStackShellMode>('list')

  return (
    <div className={phoneFrameClass}>
      <CwStackShell
        stack={outer}
        className="min-h-0 min-w-0 w-full flex-1"
        listSlot={
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-container)]">
            <CwNavBar title="外层 · 会话列表" />
            <div className="min-h-0 flex-1 p-4">
              <CwButton className="w-full" onClick={() => setOuter('detail')}>
                打开聊天 (outer=detail)
              </CwButton>
            </div>
          </div>
        }
        detailSlot={
          <CwStackShell
            stack={inner}
            className="min-h-0 min-w-0 w-full flex-1"
            listSlot={
              <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-page)]">
                <CwNavBar
                  title="内层 · 消息列表"
                  leftSlot={
                    <button
                      type="button"
                      className={CW_NAV_BAR_ICON_BUTTON_CLASS}
                      aria-label="返回会话列表"
                      onClick={() => setOuter('list')}
                    >
                      <BackIcon />
                    </button>
                  }
                />
                <div className="min-h-0 flex-1 p-4">
                  <CwButton className="w-full" onClick={() => setInner('detail')}>
                    打开子页 (inner=detail)
                  </CwButton>
                </div>
              </div>
            }
            detailSlot={
              <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-color-page)]">
                <CwNavBar
                  title="内层 · 子页面"
                  leftSlot={
                    <button
                      type="button"
                      className={CW_NAV_BAR_ICON_BUTTON_CLASS}
                      aria-label="返回消息列表"
                      onClick={() => setInner('list')}
                    >
                      <BackIcon />
                    </button>
                  }
                />
                <div className="min-h-0 flex-1 p-4 text-sm text-[var(--text-color-secondary)]">
                  内层详情页内容区
                </div>
              </div>
            }
          />
        }
      />
    </div>
  )
}

/** 嵌套栈：外层 list/detail + 内层再一套（聊天 App 窄屏模式） */
export const Nested: Story = {
  parameters: {
    docs: {
      description: {
        story: '外层：会话列表 ↔ 聊天；内层：消息列表 ↔ 子页面。顶栏均为 CwNavBar。',
      },
    },
  },
  render: () => <NestedDemo />,
}
