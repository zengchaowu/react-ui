import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from './CwButton'

const meta: Meta<typeof CwButton> = {
  title: 'Cw/CwButton',
  component: CwButton,
}

export default meta
type Story = StoryObj<typeof CwButton>

export const Primary: Story = {
  args: {
    type: 'primary',
    children: 'Primary',
  },
}

export const Outline: Story = {
  args: {
    type: 'primary',
    variant: 'outline',
    children: 'Outline',
  },
}

export const Loading: Story = {
  args: {
    type: 'primary',
    loading: true,
    children: 'Loading',
  },
}

export const Disabled: Story = {
  args: {
    type: 'primary',
    disabled: true,
    children: 'Disabled',
  },
}

export const IconAppearance: Story = {
  args: {
    appearance: 'icon',
    variant: 'text',
    size: 'compact',
    texts: { label: 'Close' },
    children: '×',
  },
}
