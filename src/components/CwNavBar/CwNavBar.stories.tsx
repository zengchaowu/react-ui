import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwNavBar } from './CwNavBar'
import {
  CW_NAV_BAR_ICON_BUTTON_CLASS,
  CW_NAV_BAR_TEXT_BUTTON_CLASS,
} from './styles'

const meta: Meta<typeof CwNavBar> = {
  title: '1. Components/Navigation/CwNavBar',
  component: CwNavBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '导航栏组件，包含标题、左侧返回按钮和右侧自定义插槽。',
      },
    },
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: '标题文本',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'emphasized', 'full-width'],
      description: '场景外观',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwNavBar>

const backArrow = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
)

function backButton(disabled = false) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        CW_NAV_BAR_ICON_BUTTON_CLASS,
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="返回"
      aria-disabled={disabled || undefined}
      onClick={() => console.log('返回按钮被点击')}
    >
      {backArrow}
    </div>
  )
}

export const Default: Story = {
  args: {
    title: '页面标题',
  },
  render: (args) => (
    <div className="w-[22.5rem]">
      <CwNavBar {...args} leftSlot={backButton()} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    title: '页面标题',
  },
  render: (args) => (
    <div className="w-[22.5rem]">
      <CwNavBar {...args} leftSlot={backButton(true)} />
    </div>
  ),
}

export const NoBackButton: Story = {
  args: {
    title: '页面标题',
  },
  render: (args) => (
    <div className="w-[22.5rem]">
      <CwNavBar {...args} />
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => {
    const textButtonClass = [
      CW_NAV_BAR_TEXT_BUTTON_CLASS,
      'text-[var(--text-color-secondary)]',
    ].join(' ')

    return (
      <div className="flex w-[17.5rem] flex-col gap-8">
        <SlotStorySection slot="left">
          <CwNavBar leftSlot={backButton()} />
        </SlotStorySection>
        <SlotStorySection slot="title">
          <CwNavBar
            titleAlign="absolute"
            titleSlot={
              <span className="[font-size:var(--font-size-body-lg)] font-semibold text-[var(--brand-color-6)]">
                自定义标题
              </span>
            }
          />
        </SlotStorySection>
        <SlotStorySection slot="right">
          <CwNavBar
            title="聊天"
            titleAlign="absolute"
            rightSlot={<span className={textButtonClass}>更多</span>}
          />
        </SlotStorySection>
      </div>
    )
  },
}

export const AppearanceEmphasized: Story = {
  args: {
    appearance: 'emphasized',
    title: 'chat',
  },
  render: (args) => (
    <div className="w-[22.5rem]">
      <CwNavBar {...args} leftSlot={backButton()} />
    </div>
  ),
}

export const AppearanceFullWidth: Story = {
  args: {
    appearance: 'full-width',
    title: 'full-width',
  },
  render: (args) => (
    <div className="w-[22.5rem]">
      <CwNavBar {...args} className="bg-[var(--bg-color-container)]" leftSlot={backButton()} />
    </div>
  ),
}
