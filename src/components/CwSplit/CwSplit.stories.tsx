import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSplit } from './CwSplit'
import type { CwSplitDirection } from './types'

function SplitDemo({
  direction = 'horizontal',
  firstMinSize = 0,
  firstMaxSize,
  secondMinSize = 0,
  initialFirstSize = 0.5,
}: {
  direction?: CwSplitDirection
  firstMinSize?: number | string
  firstMaxSize?: number | string
  secondMinSize?: number | string
  initialFirstSize?: number | string
}) {
  const [firstSize, setFirstSize] = useState<number | string>(initialFirstSize)

  return (
    <div className="w-[50rem] h-[25rem] border border-[var(--border-color)] rounded-lg overflow-hidden">
      <CwSplit
        direction={direction}
        firstSize={firstSize}
        firstMinSize={firstMinSize}
        firstMaxSize={firstMaxSize}
        secondMinSize={secondMinSize}
        onFirstSizeChange={setFirstSize}
        firstSlot={
          <div className="w-full h-full p-6 bg-[var(--bg-color-container)] flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">
                {direction === 'horizontal' ? '左侧面板' : '上方面板'}
              </h3>
              <p className="text-sm text-[var(--text-color-secondary)]">
                拖拽中间的分隔条可以调整大小
              </p>
              <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
                当前大小:{' '}
                {typeof firstSize === 'number'
                  ? `${Math.round(firstSize * 100)}%`
                  : firstSize}
              </p>
            </div>
          </div>
        }
        secondSlot={
          <div className="w-full h-full p-6 bg-[var(--bg-color-secondarycontainer)] flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">
                {direction === 'horizontal' ? '右侧面板' : '下方面板'}
              </h3>
              <p className="text-sm text-[var(--text-color-secondary)]">这是内容区域</p>
            </div>
          </div>
        }
      />
    </div>
  )
}

const meta: Meta<typeof CwSplit> = {
  title: '1. Components/Layout/CwSplit',
  component: CwSplit,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwSplit 是一个可拖拽调整大小的分隔容器组件，支持左右（horizontal）和上下（vertical）两种布局方式。可以通过拖拽中间的分隔条来调整两个面板的大小，支持设置初始大小、最小/最大尺寸限制。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: '布局方向',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SplitDemo />,
}

export const Vertical: Story = {
  render: () => <SplitDemo direction="vertical" initialFirstSize={0.4} />,
}

export const WithMinMaxSize: Story = {
  render: () => (
    <SplitDemo
      initialFirstSize={0.3}
      firstMinSize={0.2}
      firstMaxSize={0.7}
      secondMinSize={0.2}
    />
  ),
}

export const WithFixedPixelSize: Story = {
  render: () => (
    <SplitDemo
      initialFirstSize="300px"
      firstMinSize="200px"
      firstMaxSize="600px"
    />
  ),
}
