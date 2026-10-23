import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import {
  numberControlArgType,
  textControlArgType,
} from '../../storybook/argTypes'
import { CwSplit } from './CwSplit'
import type { CwSplitProps } from './types'

const meta: Meta<CwSplitProps> = {
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
  args: {
    direction: 'horizontal',
    firstSize: 0.5,
    firstMinSize: 0,
    firstMaxSize: 1,
    secondMinSize: 0,
    secondMaxSize: 1,
    dividerHitPx: 11,
  },
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: '布局方向',
    },
    firstSize: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description:
        '第一个面板大小：number 为 0–1 比例；string 可为固定像素（如 300px）。Controls 按比例调参；像素见 WithFixedPixelSize',
    }),
    firstMinSize: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description: '第一个面板最小尺寸：number 为比例；string 可为 CSS 长度（如 100px）',
    }),
    firstMaxSize: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description: '第一个面板最大尺寸：number 为比例；string 可为 CSS 长度（如 80%）',
    }),
    secondMinSize: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description: '第二个面板最小尺寸：number 为比例；string 可为 CSS 长度',
    }),
    secondMaxSize: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description: '第二个面板最大尺寸：number 为比例；string 可为 CSS 长度',
    }),
    dividerHitPx: numberControlArgType({
      min: 1,
      step: 1,
      description: '分隔条拖拽热区厚度（px）',
    }),
    texts: {
      control: false,
      description: '自定义文案',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const panelBgFirst = 'bg-[var(--bg-color-container)]'
const panelBgSecond = 'bg-[var(--bg-color-secondarycontainer)]'

function ControlledSplit({
  args,
  wrapperClass,
  firstContent,
  secondContent,
}: {
  args: CwSplitProps
  wrapperClass: string
  firstContent: (firstSize: number | string) => React.ReactNode
  secondContent: (firstSize: number | string) => React.ReactNode
}) {
  const [firstSize, setFirstSize] = useState<number | string>(args.firstSize ?? 0.5)

  useEffect(() => {
    if (args.firstSize != null) setFirstSize(args.firstSize)
  }, [args.firstSize])

  return (
    <div className={wrapperClass}>
      <CwSplit
        {...args}
        firstSize={firstSize}
        onFirstSizeChange={setFirstSize}
        firstSlot={firstContent(firstSize)}
        secondSlot={secondContent(firstSize)}
      />
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <ControlledSplit
      args={args}
      wrapperClass="w-[50rem] h-[25rem] border border-[var(--border-color)] rounded-lg overflow-hidden"
      firstContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgFirst} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">左侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">拖拽中间的分隔条可以调整大小</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小: {typeof firstSize === 'number' ? `${Math.round(firstSize * 100)}%` : firstSize}
            </p>
          </div>
        </div>
      )}
      secondContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgSecond} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">右侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">这是右侧内容区域</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小:{' '}
              {typeof firstSize === 'number'
                ? `${Math.round((1 - firstSize) * 100)}%`
                : `calc(100% - ${firstSize})`}
            </p>
          </div>
        </div>
      )}
    />
  ),
}

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    firstSize: 0.4,
  },
  render: (args) => (
    <ControlledSplit
      args={args}
      wrapperClass="w-[50rem] h-[31.25rem] border border-[var(--border-color)] rounded-lg overflow-hidden"
      firstContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgFirst} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">上方面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">拖拽中间的分隔条可以调整大小</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小: {typeof firstSize === 'number' ? `${Math.round(firstSize * 100)}%` : firstSize}
            </p>
          </div>
        </div>
      )}
      secondContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgSecond} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">下方面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">这是下方内容区域</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小:{' '}
              {typeof firstSize === 'number'
                ? `${Math.round((1 - firstSize) * 100)}%`
                : `calc(100% - ${firstSize})`}
            </p>
          </div>
        </div>
      )}
    />
  ),
}

export const WithMinMaxSize: Story = {
  args: {
    firstSize: 0.3,
    firstMinSize: 0.2,
    firstMaxSize: 0.7,
    secondMinSize: 0.2,
  },
  render: (args) => (
    <ControlledSplit
      args={args}
      wrapperClass="w-[50rem] h-[25rem] border border-[var(--border-color)] rounded-lg overflow-hidden"
      firstContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgFirst} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">左侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">最小 20%，最大 70%</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小: {typeof firstSize === 'number' ? `${Math.round(firstSize * 100)}%` : firstSize}
            </p>
          </div>
        </div>
      )}
      secondContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgSecond} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">右侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">最小 20%</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">
              当前大小:{' '}
              {typeof firstSize === 'number'
                ? `${Math.round((1 - firstSize) * 100)}%`
                : `calc(100% - ${firstSize})`}
            </p>
          </div>
        </div>
      )}
    />
  ),
}

export const WithFixedPixelSize: Story = {
  argTypes: {
    firstSize: textControlArgType('固定像素，如 300px'),
    firstMinSize: textControlArgType('最小尺寸 CSS 长度，如 200px'),
    firstMaxSize: textControlArgType('最大尺寸 CSS 长度，如 600px'),
    secondMinSize: textControlArgType(),
    secondMaxSize: textControlArgType(),
  },
  args: {
    firstSize: '300px',
    firstMinSize: '200px',
    firstMaxSize: '600px',
  },
  render: (args) => (
    <ControlledSplit
      args={args}
      wrapperClass="w-[50rem] h-[25rem] border border-[var(--border-color)] rounded-lg overflow-hidden"
      firstContent={(firstSize) => (
        <div className={`w-full h-full p-6 ${panelBgFirst} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">左侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">固定像素值：{firstSize}</p>
            <p className="text-xs text-[var(--text-color-placeholder)] mt-2">最小 200px，最大 600px</p>
          </div>
        </div>
      )}
      secondContent={() => (
        <div className={`w-full h-full p-6 ${panelBgSecond} flex items-center justify-center`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-2">右侧面板</h3>
            <p className="text-sm text-[var(--text-color-secondary)]">自适应剩余空间</p>
          </div>
        </div>
      )}
    />
  ),
}

function ContentDemo() {
  const [firstSize, setFirstSize] = useState<number | string>(0.3)
  return (
    <div className="w-[56.25rem] h-[31.25rem] border border-[var(--border-color)] rounded-lg overflow-hidden">
      <CwSplit
        firstSize={firstSize}
        onFirstSizeChange={setFirstSize}
        firstSlot={
          <div className={`w-full h-full p-4 ${panelBgFirst} overflow-y-auto`}>
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-4">文件列表</h3>
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((i) => (
                <div
                  key={i}
                  className="p-3 border border-[var(--border-color)] rounded cursor-pointer hover:bg-[var(--bg-color-component-hover)] transition-colors"
                >
                  <div className="text-sm font-medium text-[var(--text-color-primary)]">
                    文件 {i}.txt
                  </div>
                  <div className="text-xs text-[var(--text-color-placeholder)] mt-1">
                    修改时间: 2024-01-{String(i).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        secondSlot={
          <div className={`w-full h-full p-4 ${panelBgSecond} overflow-y-auto`}>
            <h3 className="text-lg font-semibold text-[var(--text-color-primary)] mb-4">文件内容</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded">
                <h4 className="text-base font-medium text-[var(--text-color-primary)] mb-2">
                  文件 1.txt
                </h4>
                <p className="text-sm text-[var(--text-color-secondary)] leading-relaxed">
                  这是文件的内容区域。你可以在这里查看和编辑文件内容。
                  左侧面板显示文件列表，可以通过拖拽中间的分隔条来调整两个面板的大小。
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded">
                <h4 className="text-base font-medium text-[var(--text-color-primary)] mb-2">
                  操作说明
                </h4>
                <ul className="text-sm text-[var(--text-color-secondary)] space-y-1 list-disc list-inside">
                  <li>拖拽中间的分隔条可以调整面板大小</li>
                  <li>可以设置最小/最大尺寸限制</li>
                  <li>支持水平和垂直两种布局方向</li>
                </ul>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export const WithContent: Story = {
  render: () => <ContentDemo />,
}

const slotPanelPlaceholderClass =
  'flex h-full w-full items-center justify-center bg-[var(--bg-color-secondarycontainer)] text-xs text-[var(--text-color-placeholder)]'

function SlotsDemo() {
  const [firstSizeFirst, setFirstSizeFirst] = useState<number | string>(0.5)
  const [firstSizeSecond, setFirstSizeSecond] = useState<number | string>(0.5)

  return (
    <div className="flex w-[50rem] flex-col gap-8">
      <SlotStorySection slot="first">
        <div className="h-[17.5rem] overflow-hidden rounded-lg border border-[var(--border-color)]">
          <CwSplit
            firstSize={firstSizeFirst}
            onFirstSizeChange={setFirstSizeFirst}
            firstSlot={
              <div className={`flex h-full w-full flex-col items-center justify-center ${panelBgFirst} p-6`}>
                <h3 className="text-lg font-semibold text-[var(--text-color-primary)]">自定义 #first</h3>
                <p className="mt-2 text-sm text-[var(--text-color-secondary)]">
                  {typeof firstSizeFirst === 'number'
                    ? `${Math.round(firstSizeFirst * 100)}%`
                    : firstSizeFirst}
                </p>
              </div>
            }
            secondSlot={<div className={slotPanelPlaceholderClass}>#second 占位</div>}
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="second">
        <div className="h-[17.5rem] overflow-hidden rounded-lg border border-[var(--border-color)]">
          <CwSplit
            firstSize={firstSizeSecond}
            onFirstSizeChange={setFirstSizeSecond}
            firstSlot={<div className={slotPanelPlaceholderClass}>#first 占位</div>}
            secondSlot={
              <div className={`flex h-full w-full flex-col items-center justify-center ${panelBgSecond} p-6`}>
                <h3 className="text-lg font-semibold text-[var(--text-color-primary)]">自定义 #second</h3>
                <p className="mt-2 text-sm text-[var(--text-color-secondary)]">
                  {typeof firstSizeSecond === 'number'
                    ? `${Math.round((1 - firstSizeSecond) * 100)}%`
                    : `calc(100% - ${firstSizeSecond})`}
                </p>
              </div>
            }
          />
        </div>
      </SlotStorySection>
    </div>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <SlotsDemo />,
}
