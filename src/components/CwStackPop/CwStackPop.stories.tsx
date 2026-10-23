import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwStackPop } from './CwStackPop'
import { useCwStackPopContext } from './context'
import type { CwStackPopStepConfig } from './types'
import { CwButton } from '../CwButton'

const stepShellClass = 'flex min-h-[50vh] flex-col p-5 box-border'

function StepPlaceholder({ title, isLast = false }: { title: string; isLast?: boolean }) {
  const api = useCwStackPopContext()
  return (
    <div className={stepShellClass}>
      {api && api.stackSize > 1 ? (
        <CwButton variant="text" className="self-start mb-4" onClick={api.back}>
          ← 上一步
        </CwButton>
      ) : null}
      <h3 className="m-0 mb-3 text-lg text-[var(--text-color-primary)]">{title}</h3>
      <p className="m-0 mb-5 text-sm text-[var(--text-color-secondary)]">
        通过 useCwStackPopContext() 使用 back / push / complete。
      </p>
      {api ? (
        <CwButton
          className="mt-auto"
          onClick={() => {
            if (isLast) api.complete()
            else api.goNext()
          }}
        >
          {isLast ? '完成' : '下一步'}
        </CwButton>
      ) : null}
    </div>
  )
}

function Step1() {
  return <StepPlaceholder title="第一步" />
}
function Step2() {
  return <StepPlaceholder title="第二步" />
}
function Step3() {
  return <StepPlaceholder title="第三步（最后一步）" isLast />
}

const steps: CwStackPopStepConfig[] = [
  { id: 'step1', component: Step1 },
  { id: 'step2', component: Step2 },
  { id: 'step3', component: Step3 },
]

const meta: Meta<typeof CwStackPop> = {
  title: '1. Components/Overlay/CwStackPop',
  component: CwStackPop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '基于 CwStack + CwDynamicSheet 的底部步骤弹窗。推荐通过 steps 打开首步；也可 ref.push(component, props) 推入第一步。步骤内通过 useCwStackPopContext() 获取 close / back / push / complete。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'text', description: '弹窗高度（如 80% 映射为 min-h-[80vh]）' },
    transition: { control: 'boolean', description: '是否启用步骤切换动画' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const MultiStep: Story = {
  args: { height: '80%', transition: true },
  render: (args) => {
    const [show, setShow] = useState(false)
    return (
      <div className="p-5">
        <p className="mb-3 text-sm text-[var(--text-color-secondary)]">
          首步通过 steps 自动推入；后续步骤由步骤内 api.goNext() 驱动。
        </p>
        <CwButton onClick={() => setShow(true)}>打开多步弹窗</CwButton>
        <CwStackPop
          show={show}
          steps={steps}
          height={args.height}
          transition={args.transition}
          onShowChange={setShow}
          onClose={() => setShow(false)}
          onComplete={() => setShow(false)}
        />
      </div>
    )
  },
}

export const SingleStep: Story = {
  render: () => {
    const [show, setShow] = useState(false)
    return (
      <div className="p-5">
        <CwButton onClick={() => setShow(true)}>打开单步</CwButton>
        <CwStackPop
          show={show}
          steps={[{ id: 'only', component: Step3 }]}
          onShowChange={setShow}
          onComplete={() => setShow(false)}
          onClose={() => setShow(false)}
        />
      </div>
    )
  },
}
