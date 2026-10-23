import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwDropdown } from './CwDropdown'
import { CwButton } from '../CwButton'
import type { CwDropdownItem, CwDropdownProps } from './types'

const sampleItems: CwDropdownItem[] = [
  { value: 'doc', label: '文档' },
  { value: 'sheet', label: '表格' },
  { value: 'board', label: '白板' },
]

const meta: Meta<typeof CwDropdown> = {
  title: '1. Components/Overlay/CwDropdown',
  component: CwDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '基于 CwPopup 的下拉菜单：触发器为按钮，支持点击展开、键盘方向键与 Enter 选择、Esc 由浮层关闭后焦点回到触发器。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    triggerType: {
      control: { type: 'select' },
      options: ['default', 'primary', 'danger'],
    },
    triggerVariant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'text', 'dashed', 'ghost'],
    },
    onSelect: { action: 'select' },
    onVisibleChange: { action: 'visibleChange' },
  },
  args: {
    items: sampleItems,
  },
}

export default meta
type Story = StoryObj<typeof CwDropdown>

export const Default: Story = {
  args: {
    items: sampleItems,
    triggerType: 'primary',
    triggerVariant: 'solid',
    size: 'medium',
  },
}

export const OutlineTrigger: Story = {
  args: {
    items: sampleItems,
    triggerType: 'default',
    triggerVariant: 'outline',
    size: 'small',
  },
}

/** 钉钉式侧栏：主色通栏 + 左侧加号 */
export const SidebarPrimary: Story = {
  args: {
    items: sampleItems,
    triggerType: 'primary',
    triggerVariant: 'solid',
    size: 'medium',
    triggerLeadingIcon: 'common--status--plus-line',
    triggerFullWidth: true,
    appearance: 'sidebar-full',
    className: 'flex w-full min-w-0 max-w-[13.75rem]',
  },
  render: (args) => (
    <div className="w-[13.75rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3">
      <CwDropdown {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    items: sampleItems,
    disabled: true,
  },
}

export const EmptyItems: Story = {
  args: {
    items: [],
  },
}

function ControlledOpenDemo(args: Partial<CwDropdownProps>) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-center gap-4">
      <CwDropdown {...args} open={open} onOpenChange={setOpen} />
      <CwButton type="default" variant="outline" size="small" onClick={() => setOpen((v) => !v)}>
        外部切换展开（当前: {String(open)}）
      </CwButton>
    </div>
  )
}

export const ControlledOpen: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => <ControlledOpenDemo {...args} />,
}

const selectedItems: CwDropdownItem[] = [
  {
    value: 'details',
    label: '详细信息',
    icon: 'common--action--menu-line',
    selected: true,
  },
  {
    value: 'icons',
    label: '大图标',
    icon: 'common--action--view-icons-line',
    selected: false,
  },
]

function CustomTriggerSelectedDemo(args: Partial<CwDropdownProps>) {
  const [selected, setSelected] = useState<string | number>('details')
  const items = useMemo(
    () => selectedItems.map((item) => ({ ...item, selected: item.value === selected })),
    [selected],
  )
  return (
    <CwDropdown
      {...args}
      items={items}
      onSelect={(value) => {
        setSelected(value)
        args.onSelect?.(value, selectedItems.find((item) => item.value === value) ?? selectedItems[0])
      }}
      triggerSlot={({ open, toggle, menuId }) => (
        <CwButton
          appearance="inline-fixed"
          variant="text"
          aria-haspopup="menu"
          aria-label="查看"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls={menuId}
          onClick={toggle}
        >
          查看
        </CwButton>
      )}
    />
  )
}

/** 自定义触发器 + 选中变色（如资源管理器「查看」；默认无勾选列） */
export const CustomTriggerSelected: Story = {
  args: {
    appearance: 'toolbar',
    items: selectedItems,
  },
  render: (args) => <CustomTriggerSelectedDemo {...args} />,
}
