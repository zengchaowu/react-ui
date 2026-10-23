import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwResizeFrame } from './CwResizeFrame'

const meta: Meta<typeof CwResizeFrame> = {
  title: '1. Components/Layout/CwResizeFrame',
  component: CwResizeFrame,
  parameters: { layout: 'padded' },
  args: {
    width: 390,
    height: 844,
    minWidth: 280,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 1200,
    resizeWidth: true,
    resizeHeight: true,
    disabled: false,
    showSize: true,
  },
}

export default meta
type Story = StoryObj<typeof CwResizeFrame>

function DevicePreview(args: Partial<ComponentProps<typeof CwResizeFrame>>) {
  const [width, setWidth] = useState(args.width ?? 390)
  const [height, setHeight] = useState(args.height ?? 844)

  return (
    <CwResizeFrame
      {...args}
      width={width}
      height={height}
      onWidthChange={setWidth}
      onHeightChange={setHeight}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--bg-color-page)]">
        <span className="text-sm text-[var(--text-color-secondary)]">预览内容区</span>
        <span className="text-xs text-[var(--text-color-placeholder)]">
          拖右侧调宽 · 拖底边调高 · 拖角落同时调整
        </span>
      </div>
    </CwResizeFrame>
  )
}

export const Default: Story = {
  render: (args) => <DevicePreview {...args} />,
}
