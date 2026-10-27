import type { Meta, StoryObj } from '@storybook/react'
import { CwFlex } from './CwFlex'
import type { CwFlexProps } from './types'
import type { CwFlexAlign, CwFlexJustify } from '@zengchaowu/ui-shared/components/CwFlex/types'

const frameClass =
  'min-h-36 w-full max-w-[36rem] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-container)]'

const itemClass = 'rounded-md px-3 py-2 text-sm text-[var(--text-color-primary)]'

const aligns: CwFlexAlign[] = ['stretch', 'flex-start', 'center', 'flex-end']
const justifies: CwFlexJustify[] = [
  'flex-start',
  'center',
  'flex-end',
  'space-between',
  'space-around',
  'space-evenly',
]

const meta: Meta<typeof CwFlex> = {
  title: '1. Components/Layout/CwFlex',
  component: CwFlex,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Flex 容器。主轴由 direction 决定，gap / padding 为像素，align 管交叉轴，justify 管主轴。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: { type: 'inline-radio' },
      options: ['row', 'column'],
      description: '主轴方向',
    },
    gap: { control: { type: 'number', min: 0, max: 48 }, description: '子项间距（px）' },
    padding: { control: { type: 'number', min: 0, max: 48 }, description: '内边距（px）' },
    align: {
      control: { type: 'select' },
      options: aligns,
      description: '交叉轴对齐',
    },
    justify: {
      control: { type: 'select' },
      options: justifies,
      description: '主轴对齐',
    },
  },
  args: {
    direction: 'row',
    gap: 12,
    padding: 16,
    align: 'center',
    justify: 'flex-start',
  },
  render: (args) => (
    <CwFlex {...args} className={frameClass}>
      <div className={`${itemClass} bg-[var(--button-brand-tint-hover-bg)]`}>标题</div>
      <div
        className={`${itemClass} bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)] py-6`}
      >
        两行说明
        <br />
        用来看交叉轴
      </div>
      <div
        className={`${itemClass} w-28 bg-[color-mix(in_srgb,var(--warning-color-6)_15%,transparent)]`}
      >
        操作
      </div>
    </CwFlex>
  ),
}

export default meta
type Story = StoryObj<typeof CwFlex>

function preset(args: Partial<CwFlexProps>): Story {
  return { args }
}

export const Default: Story = {}

export const Row: Story = preset({
  direction: 'row',
  align: 'center',
  justify: 'space-between',
})

export const Column: Story = preset({
  direction: 'column',
  align: 'stretch',
  justify: 'flex-start',
  gap: 8,
})

export const AlignStretch: Story = preset({ direction: 'row', align: 'stretch' })
export const AlignStart: Story = preset({ direction: 'row', align: 'flex-start' })
export const AlignCenter: Story = preset({ direction: 'row', align: 'center' })
export const AlignEnd: Story = preset({ direction: 'row', align: 'flex-end' })

export const JustifyStart: Story = preset({ direction: 'row', justify: 'flex-start' })
export const JustifyCenter: Story = preset({ direction: 'row', justify: 'center' })
export const JustifyEnd: Story = preset({ direction: 'row', justify: 'flex-end' })
export const JustifyBetween: Story = preset({ direction: 'row', justify: 'space-between' })
export const JustifyAround: Story = preset({ direction: 'row', justify: 'space-around' })
export const JustifyEvenly: Story = preset({ direction: 'row', justify: 'space-evenly' })
