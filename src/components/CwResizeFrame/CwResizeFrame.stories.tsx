import { useEffect, useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwResizeFrame } from './CwResizeFrame'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwResizeFrame> = {
  title: '1. Components/Layout/CwResizeFrame',
  component: CwResizeFrame,
  parameters: {
    // 勿用 centered：拉宽/拉高时画布居中重排，手柄相对指针会「漂移」
    layout: 'padded',
    docs: {
      description: {
        component:
          '可拖曳调整宽高的视口框，右侧/底边/右下角提供操作区，类似 Chrome DevTools 设备模式预览框。宜左上锚定；居中容器内拖拽时组件会暂时钉住屏幕坐标以保持跟手。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: { type: 'number', min: 200, step: 8 }, description: '初始宽度（px）' },
    height: { control: { type: 'number', min: 200, step: 8 }, description: '初始高度（px）' },
    minWidth: { control: { type: 'number', min: 120, step: 8 } },
    maxWidth: { control: { type: 'number', min: 320, step: 8 } },
    minHeight: { control: { type: 'number', min: 120, step: 8 } },
    maxHeight: { control: { type: 'number', min: 320, step: 8 } },
    resizeWidth: { control: { type: 'boolean' } },
    resizeHeight: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    showSize: { control: { type: 'boolean' }, description: '显示尺寸标签' },
    texts: { control: false },
  },
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
type Story = StoryObj<typeof meta>

function DevicePreviewDemo(args: Partial<ComponentProps<typeof CwResizeFrame>>) {
  const [width, setWidth] = useState(args.width ?? 390)
  const [height, setHeight] = useState(args.height ?? 844)

  useEffect(() => {
    if (args.width != null) setWidth(args.width)
  }, [args.width])

  useEffect(() => {
    if (args.height != null) setHeight(args.height)
  }, [args.height])

  return (
    <div className="flex min-h-[30rem] w-full items-start justify-start p-4">
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
    </div>
  )
}

export const DevicePreview: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '左上锚定展示。若整页居中，宽度变化时框体中心不动，右边只移动一半位移，角拖（宽高一起变）会更不跟手。',
      },
    },
  },
  render: (args) => <DevicePreviewDemo {...args} />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    width: 320,
    height: 480,
    minWidth: 240,
    maxWidth: 640,
    minHeight: 320,
    maxHeight: 800,
  },
  render: (args) => <WithSlotsDemo args={args} />,
}

function WithSlotsDemo({ args }: { args: Story['args'] }) {
  const [width, setWidth] = useState(args?.width ?? 320)
  const [height, setHeight] = useState(args?.height ?? 480)

  useEffect(() => {
    if (args?.width != null) setWidth(args.width)
  }, [args?.width])

  useEffect(() => {
    if (args?.height != null) setHeight(args.height)
  }, [args?.height])

  return (
    <SlotStorySection slot="default">
      <div className="flex w-full items-start justify-start">
        <CwResizeFrame
          width={width}
          height={height}
          minWidth={args?.minWidth}
          maxWidth={args?.maxWidth}
          minHeight={args?.minHeight}
          maxHeight={args?.maxHeight}
          resizeWidth={args?.resizeWidth}
          resizeHeight={args?.resizeHeight}
          disabled={args?.disabled}
          showSize={args?.showSize}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--brand-color-focus)]">
            <span className="text-sm font-medium text-[var(--text-color-anti)]">
              自定义 #default 内容
            </span>
            <span className="text-xs text-[var(--text-color-anti)] opacity-80">
              {width} × {height}
            </span>
          </div>
        </CwResizeFrame>
      </div>
    </SlotStorySection>
  )
}
