import type { Meta, StoryObj } from '@storybook/react'
import { storyAlert } from '../../storybook/storyAlert'
import { CwCell } from './CwCell'
import { CwCellGroup } from './CwCellGroup'
import type { CwCellGroupProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwCell> = {
  title: '1. Components/Display/CwCell',
  component: CwCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
    },
    subtitle: {
      control: { type: 'text' },
    },
    showArrow: {
      control: { type: 'boolean' },
    },
    showUnderline: {
      control: { type: 'boolean' },
    },
    underlineAlign: {
      control: { type: 'select' },
      options: ['full', 'indent'],
      description: '下划线对齐方式',
    },
    clickable: {
      control: { type: 'boolean' },
    },
    appearance: {
      control: { type: 'select' },
      options: [
        'default',
        'compact-row',
        'fullWidth',
        'hero',
        'inset-group',
        'sheet',
        'compact',
        'form',
      ],
      description: '场景外观',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwCell>

export const Default: Story = {
  args: {},
}

export const WithArrow: Story = {
  args: {
    title: '标题',
    subtitle: '副标题',
    showArrow: true,
    showUnderline: true,
    clickable: true,
  },
  render: (args) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      console.log('Cell clicked:', event)
      storyAlert('Cell被点击了！')
    }
    return (
      <div className="w-[25rem]">
        <CwCell {...args} onClick={handleClick} />
      </div>
    )
  },
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[25rem] flex-col gap-8">
      <SlotStorySection slot="title">
        <CwCell
          title="标题"
          subtitle="副标题"
          showArrow
          titleSlot={<span className="text-[var(--brand-color-6)]">自定义标题</span>}
        />
      </SlotStorySection>
      <SlotStorySection slot="right">
        <CwCell
          title="标题"
          subtitle="副标题"
          showArrow
          rightSlot={
            <span className="text-sm text-[var(--text-color-secondary)]">详情</span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="title">
        <CwCell subtitle="副标题" titleSlot={<span>仅标题插槽</span>} />
      </SlotStorySection>
      <SlotStorySection slot="subtitle">
        <CwCell
          title="标题"
          subtitleSlot={
            <span className="text-xs text-[var(--text-color-placeholder)]">
              自定义副标题
            </span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="content">
        <CwCell
          contentSlot={<div className="text-sm">完全自定义 content</div>}
        />
      </SlotStorySection>
    </div>
  ),
}

export const AppearanceCompactRow: Story = {
  render: () => (
    <div className="w-[25rem] bg-[var(--bg-color-page)] p-2">
      <CwCellGroup appearance="compact-row">
        <CwCell title="settings" subtitle="设置卡片组" showArrow clickable />
        <CwCell title="第二项" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}

export const AppearanceFullWidth: Story = {
  render: () => (
    <div className="w-[25rem] bg-[var(--bg-color-page)] p-2">
      <CwCellGroup appearance="fullWidth">
        <CwCell title="fullWidth" showArrow clickable />
        <CwCell title="第二项" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}

export const AppearanceHero: Story = {
  render: () => (
    <div className="w-[25rem] bg-[var(--bg-color-page)] p-2">
      <CwCellGroup appearance="fullWidth">
        <CwCell appearance="hero" title="profile" subtitle="资料顶栏" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}

export const AppearanceInsetGroup: Story = {
  render: () => (
    <div className="w-[25rem] bg-[var(--bg-color-page)] p-2">
      <CwCellGroup appearance="inset-group">
        <CwCell title="inset-group" subtitle="组内嵌底" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}

export const AppearanceSheet: Story = {
  render: () => (
    <div className="w-[25rem] bg-[var(--bg-color-page)] p-2">
      <CwCellGroup appearance="sheet">
        <CwCell title="sheet" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}

export const AppearanceCompact: Story = {
  args: {
    appearance: 'compact',
    title: 'compact',
  },
  render: (args) => (
    <div className="w-[25rem]">
      <CwCell {...args} />
    </div>
  ),
}

export const AppearanceForm: Story = {
  render: () => (
    <div className="w-[25rem]">
      <CwCellGroup
        cellAppearance="form"
        className="rounded-xl border border-[var(--border-color)]"
      >
        <CwCell
          title="标签"
          showUnderline
          rightSlot={<span className="text-sm">表单值</span>}
        />
      </CwCellGroup>
    </div>
  ),
}

type CellGroupStory = StoryObj<typeof CwCellGroup>

export const InGroup: CellGroupStory = {
  render: (args: CwCellGroupProps) => (
    <div className="w-[25rem]">
      <CwCellGroup {...args} appearance="compact-row">
        <CwCell title="账号与安全" showArrow clickable />
        <CwCell title="通知" showArrow clickable />
        <CwCell title="通用" showArrow clickable />
      </CwCellGroup>
    </div>
  ),
}
