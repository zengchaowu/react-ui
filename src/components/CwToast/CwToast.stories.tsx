import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwToast } from './CwToast'
import { showCwToast } from './showCwToast'
import type { CwRichTextNode, CwToastType } from './types'

const meta: Meta<typeof CwToast> = {
  title: '1. Components/Overlay/CwToast',
  component: CwToast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '自研 Toast 轻提示组件，支持文案、成功/失败/加载中类型与位置，可声明式使用或通过 showCwToast() 命令式调用。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    visible: {
      control: 'boolean',
      description: '是否显示',
    },
    message: {
      control: 'text',
      description: '提示文案',
    },
    type: {
      control: 'select',
      options: ['text', 'success', 'fail', 'loading'],
      description: '类型',
    },
    position: {
      control: 'select',
      options: ['top', 'middle', 'bottom'],
      description: '显示位置',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwToast>

const triggerClass =
  'cursor-pointer rounded bg-[var(--bg-color-secondarycomponent)] hover:bg-[var(--bg-color-component-hover)] px-3 py-1.5 text-sm'

const successTriggerClass =
  'cursor-pointer rounded bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--success-color-6)_20%,transparent)] px-3 py-1.5 text-sm'

const failTriggerClass =
  'cursor-pointer rounded bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--error-color-6)_20%,transparent)] px-3 py-1.5 text-sm'

const loadingTriggerClass =
  'cursor-pointer rounded bg-[var(--button-brand-tint-hover-bg)] hover:bg-[var(--button-brand-tint-active-bg)] px-3 py-1.5 text-sm'

function Trigger({
  className,
  onClick,
  children,
}: {
  className: string
  onClick: () => void
  children: string
}) {
  return (
    <div role="button" tabIndex={0} className={className} onClick={onClick}>
      {children}
    </div>
  )
}

function DeclarativeToastDemo() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('提示内容')
  const [type, setType] = useState<CwToastType>('text')

  const open = (nextType: CwToastType) => {
    setType(nextType)
    setMessage(
      nextType === 'text'
        ? '提示内容'
        : nextType === 'success'
          ? '操作成功'
          : nextType === 'fail'
            ? '操作失败'
            : '加载中...',
    )
    setVisible(true)
  }

  const close = () => {
    setVisible(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <CwToast
        visible={visible}
        message={message}
        type={type}
        onVisibleChange={setVisible}
        onClose={close}
      />
      <div className="flex flex-wrap gap-2">
        <Trigger className={triggerClass} onClick={() => open('text')}>
          Text
        </Trigger>
        <Trigger className={successTriggerClass} onClick={() => open('success')}>
          Success
        </Trigger>
        <Trigger className={failTriggerClass} onClick={() => open('fail')}>
          Fail
        </Trigger>
        <Trigger className={loadingTriggerClass} onClick={() => open('loading')}>
          Loading
        </Trigger>
        <Trigger className={triggerClass} onClick={close}>
          Close
        </Trigger>
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    visible: true,
    message: '这是一条提示',
    type: 'text',
    position: 'top',
  },
}

export const Success: Story = {
  args: {
    visible: true,
    message: '操作成功',
    type: 'success',
    position: 'middle',
  },
}

/** 长无空格串应在 max-width 内自动换行，盒子随内容增高，不应横向溢出或截断文案 */
export const LongMessage: Story = {
  args: {
    visible: true,
    message:
      '「这是一段非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的文件名用来测试 Toast 是否会在框内换行」下载完成',
    type: 'success',
    position: 'top',
  },
}

export const Fail: Story = {
  args: {
    visible: true,
    message: '操作失败',
    type: 'fail',
    position: 'middle',
  },
}

export const Loading: Story = {
  args: {
    visible: true,
    message: '加载中...',
    type: 'loading',
    position: 'middle',
  },
}

export const ImperativeAPI: Story = {
  render: () => {
    const show = (type: CwToastType) => {
      showCwToast({
        message:
          type === 'text'
            ? '纯文案提示'
            : type === 'success'
              ? '成功'
              : type === 'fail'
                ? '失败'
                : '加载中...',
        type,
        duration: type === 'loading' ? 0 : 2000,
        onClose: () => console.log('toast closed'),
      })
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-sm text-[var(--text-color-secondary)]">
          点击按钮通过 showCwToast() 显示 Toast（默认 replace，会覆盖当前）：
        </p>
        <div className="flex flex-wrap gap-2">
          <Trigger className={triggerClass} onClick={() => show('text')}>
            Text
          </Trigger>
          <Trigger className={successTriggerClass} onClick={() => show('success')}>
            Success
          </Trigger>
          <Trigger className={failTriggerClass} onClick={() => show('fail')}>
            Fail
          </Trigger>
          <Trigger className={loadingTriggerClass} onClick={() => show('loading')}>
            Loading
          </Trigger>
        </div>
      </div>
    )
  },
}

export const RichTextDsl: Story = {
  render: () => {
    const show = () => {
      showCwToast({
        type: 'success',
        duration: 8000,
        dsl: [
          { type: 'text', text: '下载完成 · ' },
          { type: 'link', href: 'cw-demo:open', text: '打开' },
        ] as CwRichTextNode[],
        onLinkClick: (href) => console.log('link', href),
      })
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-sm text-[var(--text-color-secondary)]">
          CwRichText DSL：多链接、主题色，由 onLinkClick 按 href 分发
        </p>
        <div className="w-fit">
          <Trigger className={triggerClass} onClick={show}>
            显示
          </Trigger>
        </div>
      </div>
    )
  },
}

export const PauseOnHover: Story = {
  render: () => {
    const show = () => {
      showCwToast({
        message: '鼠标移入本提示可暂停自动关闭，移出后继续倒计时',
        type: 'success',
        duration: 5000,
      })
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-sm text-[var(--text-color-secondary)]">
          显示 5 秒；悬停 Toast 内容区应暂停，移出后继续
        </p>
        <div className="w-fit">
          <Trigger className={triggerClass} onClick={show}>
            显示 Toast
          </Trigger>
        </div>
      </div>
    )
  },
}

export const ReplaceMode: Story = {
  render: () => {
    const show = () => {
      showCwToast({ message: '第一条', duration: 3000 })
      setTimeout(() => {
        showCwToast({ message: '第二条（覆盖第一条）', type: 'success', duration: 3000 })
      }, 800)
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-sm text-[var(--text-color-secondary)]">
          1 秒内会先显示「第一条」，再被「第二条」覆盖（mode: replace 默认）
        </p>
        <div className="w-fit">
          <Trigger className={triggerClass} onClick={show}>
            触发覆盖
          </Trigger>
        </div>
      </div>
    )
  },
}

export const QueueMode: Story = {
  render: () => {
    const show = () => {
      showCwToast({ message: '第 1 条', duration: 1500, mode: 'queue' })
      showCwToast({ message: '第 2 条', type: 'success', duration: 1500, mode: 'queue' })
      showCwToast({ message: '第 3 条', type: 'fail', duration: 1500, mode: 'queue' })
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-sm text-[var(--text-color-secondary)]">
          点击后依次显示 3 条 Toast（mode: queue）
        </p>
        <div className="w-fit">
          <Trigger className={triggerClass} onClick={show}>
            排队显示
          </Trigger>
        </div>
      </div>
    )
  },
}

export const DeclarativeWithToggle: Story = {
  render: () => <DeclarativeToastDemo />,
}

export const Imperative: Story = {
  render: () => (
    <button
      type="button"
      onClick={() => {
        showCwToast({ message: '命令式提示', type: 'success', duration: 2000 })
      }}
    >
      showCwToast
    </button>
  ),
}
