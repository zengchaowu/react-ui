import type { Meta, StoryObj } from '@storybook/react'
import { CwSlot } from './CwSlot'

const meta: Meta<typeof CwSlot> = {
  title: '1. Components/Layout/CwSlot',
  component: CwSlot,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Storybook 用插槽占位示意：固定 24×24、2px 灰色虚线框，中间字母 S。不在业务代码中使用。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    block: {
      control: { type: 'boolean' },
      description: '是否铺满父容器',
    },
    texts: {
      control: false,
      description: '自定义文案',
    },
  },
  args: {
    block: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Shared fixed parent so Controls `block` visibly fills vs shrinks. */
const withSizedParent: Story['render'] = (args) => (
  <div className="h-24 w-48 rounded border border-[var(--border-color)] p-1">
    <CwSlot {...args} />
  </div>
)

export const Inline: Story = {
  args: {
    block: false,
  },
  render: withSizedParent,
}

export const Block: Story = {
  args: {
    block: true,
  },
  render: withSizedParent,
}
