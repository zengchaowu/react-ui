import type { Meta, StoryObj } from '@storybook/react'
import { CwChatToolbar } from './index'
import type { CwChatToolbarItemConfig } from './types'
import { storybookChatToolbarDemoItems } from '../../storybook/chatToolbarDemoItems'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwChatToolbar> = {
  title: '1. Components/Chat/CwChatToolbar',
  component: CwChatToolbar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    rootClass: { control: { type: 'text' } },
    items: { control: false },
    stickerPacks: { control: false },
    texts: { control: false },
  },
  args: {
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof CwChatToolbar>

const toolbarShellClass = 'max-w-xl border border-[var(--border-color)] rounded-t-md'

const demoItems: CwChatToolbarItemConfig[] = [...storybookChatToolbarDemoItems]

export const DefaultConfig: Story = {
  args: {
    items: demoItems,
    rootClass: toolbarShellClass,
  },
  render: (args) => (
    <CwChatToolbar
      {...args}
      onItemClick={(item) => console.info('item-click', item)}
    />
  ),
}

export const ExtendedViaConfig: Story = {
  args: {
    items: [
      ...storybookChatToolbarDemoItems,
      {
        key: 'more',
        label: '更多',
        icon: 'common--status--plus-line',
        action: { type: 'emit' },
      },
    ],
    rootClass: toolbarShellClass,
  },
  render: (args) => <CwChatToolbar {...args} onItemClick={(item) => console.info(item)} />,
}

const pureJsonItems: CwChatToolbarItemConfig[] = [
  { key: 'a', label: '仅发事件', icon: 'chat--msg--emoji-line', action: { type: 'emit' } },
  {
    key: 'b',
    label: '选图',
    icon: 'common--media--image-line',
    action: { type: 'open-file-picker', accept: 'image/*' },
  },
]

export const PureJsonStyle: Story = {
  args: {
    items: pureJsonItems,
    rootClass: toolbarShellClass,
  },
  render: (args) => <CwChatToolbar {...args} onItemClick={(item) => console.info(item)} />,
}

const slotToolbarClass = 'max-w-xl border border-[var(--border-color)] rounded-t-md'

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex max-w-xl flex-col gap-8">
      <SlotStorySection slot="prepend">
        <CwChatToolbar
          className={slotToolbarClass}
          items={demoItems}
          prependSlot={
            <span className="px-1 text-xs text-[var(--text-color-secondary)]">前置</span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="append">
        <CwChatToolbar
          className={slotToolbarClass}
          items={demoItems}
          appendSlot={
            <span className="px-1 text-xs text-[var(--text-color-secondary)]">后置</span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="item-emoji">
        <CwChatToolbar
          className={slotToolbarClass}
          items={demoItems}
          itemSlots={{
            'item-emoji': ({ disabled, onClick }) => (
              <div
                role="button"
                tabIndex={0}
                aria-disabled={disabled}
                className="rounded-md border border-dashed border-[var(--brand-color-6)] px-2 py-1 text-xs text-[var(--brand-color-6)]"
                onClick={onClick}
              >
                自定义表情
              </div>
            ),
          }}
        />
      </SlotStorySection>
    </div>
  ),
}
