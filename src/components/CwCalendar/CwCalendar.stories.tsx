import type { Meta, StoryObj } from '@storybook/react'
import { CwCalendar } from './CwCalendar'

const meta: Meta<typeof CwCalendar> = {
  title: '1. Components/Display/CwCalendar',
  component: CwCalendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Month calendar panel with optional lunar / solar-term / Chinese holiday sublabels. Shell chrome (flyout, focus timer) stays in the host app.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLunar: { control: 'boolean' },
    showSolarTerms: { control: 'boolean' },
    showChineseHolidays: { control: 'boolean' },
    showHeading: { control: 'boolean' },
    collapsible: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof CwCalendar>

export const Default: Story = {
  render: (args) => (
    <div style={{ width: '22.5rem' }}>
      <CwCalendar {...args} />
    </div>
  ),
  args: {
    showHeading: true,
    showMonthBar: true,
    showLunar: true,
    showSolarTerms: true,
    showChineseHolidays: false,
  },
}

export const WithChineseHolidays: Story = {
  ...Default,
  args: {
    ...Default.args,
    showChineseHolidays: true,
  },
}
