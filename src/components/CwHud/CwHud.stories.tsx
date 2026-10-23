import type { Meta, StoryObj } from '@storybook/react'
import { CwHud } from './CwHud'
import { hideHud, showHud } from './showHud'

const meta: Meta<typeof CwHud> = {
  title: '1. Components/Overlay/showHud',
  component: CwHud,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '全局**单例** Loading HUD（`showHud` / `hideHud`）。多次 `showHud` 不会叠多层 DOM，只更新文案并用 session 引用计数；内层 `close` 后恢复外层文案，全部 close 后才真正关闭。',
      },
    },
  },
  argTypes: {
    visible: { control: { type: 'boolean' }, description: '是否展示' },
    text: { control: { type: 'text' }, description: '提示文案' },
    mask: { control: { type: 'boolean' }, description: '是否显示遮罩' },
    maskClosable: { control: { type: 'boolean' }, description: '点击遮罩是否关闭' },
    loadingType: {
      control: { type: 'select' },
      options: ['spinner', 'dots', 'bars'],
      description: '加载动画类型',
    },
    loadingSize: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '加载动画尺寸',
    },
    texts: { control: false },
  },
  args: {
    visible: true,
    text: '加载中…',
    mask: true,
    maskClosable: false,
    loadingType: 'spinner',
    loadingSize: 'medium',
  },
}

export default meta
type Story = StoryObj<typeof CwHud>

export const Playground: Story = {
  render: (args) => <CwHud {...args} />,
}

export const Basic: Story = {
  render: (args) => {
    const open = () => {
      const { close } = showHud({
        text: args.text,
        mask: args.mask,
        maskClosable: args.maskClosable,
        loadingType: args.loadingType,
        loadingSize: args.loadingSize,
      })
      setTimeout(close, 1500)
    }
    return (
      <div className="flex gap-2">
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded bg-[var(--bg-color-secondarycomponent)] px-3 py-1 text-sm"
          onClick={open}
        >
          showHud（1.5s 后 close）
        </div>
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded bg-[var(--bg-color-secondarycomponent)] px-3 py-1 text-sm"
          onClick={hideHud}
        >
          hideHud
        </div>
      </div>
    )
  },
}

/** 演示引用计数：始终只有一层 HUD；先见「第二层」，b.close 后回到「第一层」，再 a.close 关闭 */
export const NestedClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '不是叠两个 HUD。两次 `showHud` 共用一个实例：文案先被内层盖成「第二层」，`b.close()` 后恢复「第一层」，`a.close()` 后才消失。',
      },
    },
  },
  render: (args) => {
    const open = () => {
      // showDelayMs:0 便于立刻看到文案切换；生产默认 500ms 防闪
      const a = showHud({ text: args.text ?? '第一层', showDelayMs: 0 })
      const b = showHud({ text: '第二层', showDelayMs: 0 })
      setTimeout(() => {
        b.close()
        setTimeout(a.close, 1000)
      }, 1200)
    }
    return (
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer rounded bg-[var(--bg-color-secondarycomponent)] px-3 py-1 text-sm"
        onClick={open}
      >
        两次 showHud：先第二层 → close 回第一层 → 再关闭
      </div>
    )
  },
  args: {
    text: '第一层',
  },
}

