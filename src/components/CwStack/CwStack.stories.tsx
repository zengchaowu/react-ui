import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwStack } from './CwStack'
import type { CwStackComponent, CwStackExposed } from './types'

function Page1() {
  return (
    <div className="p-6 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg">
      <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">页面 1</h3>
      <p className="text-sm text-[var(--text-color-secondary)]">这是第一个页面</p>
    </div>
  )
}

function Page2() {
  return (
    <div className="p-6 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg">
      <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">页面 2</h3>
      <p className="text-sm text-[var(--text-color-secondary)]">这是第二个页面</p>
    </div>
  )
}

function Page3() {
  return (
    <div className="p-6 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg">
      <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">页面 3</h3>
      <p className="text-sm text-[var(--text-color-secondary)]">这是第三个页面</p>
    </div>
  )
}

function StackDemo() {
  const stackRef = useRef<CwStackExposed>(null)
  const [stackSize, setStackSize] = useState(0)

  const pushPage = (component: CwStackComponent) => {
    stackRef.current?.push(component)
  }

  return (
    <div className="w-[37.5rem] space-y-4">
      <div className="flex items-center justify-between p-4 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg">
        <div className="text-sm text-[var(--text-color-secondary)]">
          栈大小: <span className="font-semibold text-[var(--text-color-primary)]">{stackSize}</span>
        </div>
        <div className="flex gap-2">
          {[
            { name: '页面 1', component: Page1 },
            { name: '页面 2', component: Page2 },
            { name: '页面 3', component: Page3 },
          ].map((page) => (
            <div
              key={page.name}
              onClick={() => pushPage(page.component)}
              className="px-3 py-1.5 text-sm bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded cursor-pointer hover:bg-[var(--brand-color-hover)] transition-colors"
            >
              Push {page.name}
            </div>
          ))}
          <div
            onClick={() => stackRef.current?.pop()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              stackSize > 0
                ? 'bg-[var(--error-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--error-color-hover)] cursor-pointer'
                : 'bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] cursor-not-allowed'
            }`}
          >
            Pop
          </div>
          <div
            onClick={() => stackRef.current?.clear()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              stackSize > 0
                ? 'bg-[var(--warning-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--warning-color-hover)] cursor-pointer'
                : 'bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] cursor-not-allowed'
            }`}
          >
            Clear
          </div>
        </div>
      </div>
      <div className="flex h-[12.5rem] min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-4">
        <CwStack
          ref={stackRef}
          slideTransition
          className="min-h-0 min-w-0 flex-1"
          onStackChange={(next) => setStackSize(next.length)}
        />
      </div>
    </div>
  )
}

const meta: Meta<typeof CwStack> = {
  title: '1. Components/Layout/CwStack',
  component: CwStack,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwStack 是一个栈容器组件，用于管理路由级别的组件栈。提供 push 和 pop 方法来管理组件栈。默认 stackCache 使用绝对定位叠层，宿主必须有明确高度（仅 min-h 会塌成 0）。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialComponent: { control: false },
    initialProps: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <StackDemo />,
}

export const WithInitialComponent: Story = {
  args: {
    initialComponent: Page1,
  },
  render: (args) => (
    <div className="w-[37.5rem] space-y-4">
      <div className="flex h-[12.5rem] min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-4">
        <CwStack
          slideTransition
          initialComponent={args.initialComponent ?? Page1}
          className="min-h-0 min-w-0 flex-1"
        />
      </div>
    </div>
  ),
}
