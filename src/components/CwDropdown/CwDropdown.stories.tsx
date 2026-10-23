import type { Meta, StoryObj } from '@storybook/react'
import { CwDropdown } from './CwDropdown'
import type { CwDropdownItem } from './types'

const sampleItems: CwDropdownItem[] = [
  { value: 'doc', label: '文档' },
  { value: 'sheet', label: '表格' },
  { value: 'board', label: '白板' },
]

const meta: Meta<typeof CwDropdown> = {
  title: '1. Components/Overlay/CwDropdown',
  component: CwDropdown,
  args: {
    items: sampleItems,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const EmptyItems: Story = {
  args: {
    items: [],
  },
}

export const CustomTrigger: Story = {
  render: (args) => (
    <CwDropdown
      {...args}
      items={args.items ?? sampleItems}
      triggerSlot={({ open, toggle, menuId }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-controls={menuId}>
          查看
        </button>
      )}
    />
  ),
}
