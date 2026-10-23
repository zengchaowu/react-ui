import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwPopup } from './CwPopup'
import { createDimensions } from './plugins/dimensions'
import { createPosition } from './plugins/position'
import { createOffset } from './plugins/offset'
import { createFlip } from './plugins/flip'
import { createPreventOverflow } from './plugins/prevent-overflow'
import { createArrow } from './plugins/arrow'

const plugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
  createPreventOverflow({ padding: 8 }),
  createArrow({
    margin: 8,
    arrowClass:
      'w-2 h-2 bg-[var(--bg-color-container)] border-[var(--border-color)]',
  }),
]

const meta: Meta<typeof CwPopup> = {
  title: '1. Components/Overlay/CwPopup',
  component: CwPopup,
}

export default meta
type Story = StoryObj<typeof CwPopup>

export const Default: Story = {
  args: {
    placement: 'top',
    trigger: 'hover',
    plugins,
    triggerSlot: (
      <button
        type="button"
        className="rounded-md bg-[var(--brand-color-6)] px-4 py-2 text-[var(--text-color-anti)]"
      >
        悬停显示
      </button>
    ),
    children: (
      <div className="px-3 py-1.5 text-[var(--text-color-primary)]">弹出层内容</div>
    ),
  },
}

export const VirtualReference: Story = {
  render: () => {
    const [visible, setVisible] = useState(false)
    const [point, setPoint] = useState({ x: 120, y: 120 })

    const virtualReference = {
      getBoundingClientRect: () =>
        new DOMRect(point.x, point.y, 0, 0),
    }

    return (
      <div
        className="h-[400px] w-full"
        onMouseMove={(event) => {
          setPoint({ x: event.clientX, y: event.clientY })
        }}
      >
        <button
          type="button"
          className="rounded-md bg-[var(--brand-color-6)] px-4 py-2 text-[var(--text-color-anti)]"
          onClick={() => setVisible((prev) => !prev)}
        >
          切换虚拟参考浮层
        </button>
        <CwPopup
          trigger="manual"
          placement="bottom-start"
          modelValue={visible}
          virtualReference={virtualReference}
          plugins={plugins}
          closeOnClickOutside={false}
          onUpdateModelValue={setVisible}
        >
          <div className="px-3 py-1.5 text-[var(--text-color-primary)]">
            跟随虚拟参考元素
          </div>
        </CwPopup>
      </div>
    )
  },
}
