import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectSheet } from './CwSelectSheet'
import { showSelectSheet } from './showSelectSheet'
import type { CwSelectSheetOption } from './types'

const educationLevelOptions: CwSelectSheetOption[] = [
  { value: 'junior_high_below', label: '初中及以下学历' },
  { value: 'junior_high_equivalent', label: '初中及同等学历' },
  { value: 'high_school_equivalent', label: '高中及同等学历' },
  { value: 'technical_secondary', label: '中专' },
  { value: 'junior_college', label: '大专' },
  { value: 'bachelor', label: '本科' },
  { value: 'postgraduate', label: '研究生' },
  { value: 'master', label: '硕士' },
  { value: 'doctorate', label: '博士' },
  { value: 'other', label: '其他' },
]

const meta: Meta<typeof CwSelectSheet> = {
  title: '1. Components/Overlay/CwSelectSheet',
  component: CwSelectSheet,
}

export default meta
type Story = StoryObj<typeof CwSelectSheet>

export const Default: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度',
    columns: 3,
  },
  render: (args) => (
    <button
      type="button"
      onClick={() => {
        void showSelectSheet(args)
      }}
    >
      打开选择器
    </button>
  ),
}
