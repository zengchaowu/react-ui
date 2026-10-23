import type { Meta, StoryObj } from '@storybook/react'
import { CwTag } from './CwTag'
import { defaultTexts } from './texts'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwTag> = {
  title: '1. Components/Display/CwTag',
  component: CwTag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '标签组件，用于展示标签信息。支持删除按钮、多种类型和尺寸。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: { type: 'text' },
      description: '标签内容',
    },
    closable: {
      control: { type: 'boolean' },
      description: '是否显示删除按钮',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    type: {
      control: { type: 'select' },
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      description: '标签类型',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '标签尺寸',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwTag>

export const Default: Story = {
  args: {
    content: '标签',
    texts: defaultTexts,
  },
}

export const WithClose: Story = {
  args: {
    content: '可删除标签',
    closable: true,
    texts: defaultTexts,
  },
  render: (args) => (
    <CwTag
      {...args}
      onClose={(event) => {
        console.log('Close clicked', event)
      }}
    />
  ),
}

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <CwTag content="默认标签" type="default" />
        <CwTag content="主要标签" type="primary" />
        <CwTag content="成功标签" type="success" />
        <CwTag content="警告标签" type="warning" />
        <CwTag content="危险标签" type="danger" />
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <CwTag content="小标签" size="small" />
      <CwTag content="中标签" size="medium" />
      <CwTag content="大标签" size="large" />
    </div>
  ),
}

export const Closable: Story = {
  render: () => {
    const handleClose = (event: MouseEvent) => {
      console.log('Close clicked', event)
    }
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <CwTag content="可删除" closable onClose={handleClose} />
          <CwTag content="主要可删除" type="primary" closable onClose={handleClose} />
          <CwTag content="成功可删除" type="success" closable onClose={handleClose} />
          <CwTag content="警告可删除" type="warning" closable onClose={handleClose} />
          <CwTag content="危险可删除" type="danger" closable onClose={handleClose} />
        </div>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <CwTag content="禁用标签" disabled />
        <CwTag content="禁用可删除" closable disabled />
        <CwTag content="禁用主要" type="primary" disabled />
      </div>
    </div>
  ),
}

export const Readonly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <CwTag content="只读标签" readonly />
        <CwTag content="只读可删除" closable readonly />
        <CwTag content="只读主要" type="primary" readonly />
      </div>
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="default">
      <CwTag type="primary" closable>
        <span className="font-semibold">自定义标签内容</span>
      </CwTag>
    </SlotStorySection>
  ),
}
