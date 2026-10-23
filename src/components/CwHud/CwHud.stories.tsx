import type { Meta, StoryObj } from '@storybook/react'
import { CwHud } from './CwHud'
import { hideHud, showHud } from './showHud'

const meta: Meta<typeof CwHud> = {
  title: '1. Components/Overlay/showHud',
  component: CwHud,
}

export default meta
type Story = StoryObj<typeof CwHud>

export const Default: Story = {
  args: {
    visible: true,
    text: '加载中…',
    mask: true,
    maskClosable: false,
    loadingType: 'spinner',
    loadingSize: 'medium',
  },
}

export const Imperative: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          const { close } = showHud({
            text: args.text,
            mask: args.mask,
            maskClosable: args.maskClosable,
            loadingType: args.loadingType,
            loadingSize: args.loadingSize,
          })
          window.setTimeout(close, 1500)
        }}
      >
        showHud（1.5s 后 close）
      </button>
      <button type="button" onClick={hideHud}>
        hideHud
      </button>
    </div>
  ),
}
