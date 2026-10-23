import type { Meta, StoryObj } from '@storybook/react'
import { CwCascaderSheet } from './CwCascaderSheet'
import { showCascaderSheet } from './showCascaderSheet'
import type { CwCascaderSheetOption } from './types'

const regionOptions: CwCascaderSheetOption[] = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      {
        label: '东城区',
        value: 'dongcheng',
        children: [
          { label: '东华门街道', value: 'donghuamen' },
          { label: '景山街道', value: 'jingshan' },
        ],
      },
      {
        label: '西城区',
        value: 'xicheng',
        children: [
          { label: '西长安街街道', value: 'xichanganjie' },
          { label: '新街口街道', value: 'xinjiekou' },
        ],
      },
    ],
  },
]

const meta: Meta<typeof CwCascaderSheet> = {
  title: '1. Components/Overlay/CwCascaderSheet',
  component: CwCascaderSheet,
}

export default meta
type Story = StoryObj<typeof CwCascaderSheet>

export const Default: Story = {
  args: {
    options: regionOptions,
    title: '选择地区',
  },
  render: (args) => (
    <button
      type="button"
      onClick={() => {
        void showCascaderSheet(args)
      }}
    >
      打开级联选择
    </button>
  ),
}
