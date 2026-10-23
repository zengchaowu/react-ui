import type { Meta, StoryObj } from '@storybook/react'
import { CwCascaderPanel } from './CwCascaderPanel'
import type { CwCascaderPanelOption } from './types'

const regionOptions: CwCascaderPanelOption[] = [
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
  {
    label: '上海市',
    value: 'shanghai',
    children: [
      {
        label: '黄浦区',
        value: 'huangpu',
        children: [
          { label: '南京东路街道', value: 'nanjingdonglu' },
          { label: '外滩街道', value: 'waitan' },
        ],
      },
    ],
  },
]

const meta: Meta<typeof CwCascaderPanel> = {
  title: '1. Components/Form/CwCascaderPanel',
  component: CwCascaderPanel,
}

export default meta
type Story = StoryObj<typeof CwCascaderPanel>

export const Default: Story = {
  args: {
    options: regionOptions,
    value: ['beijing', 'dongcheng'],
    appearance: 'popup',
  },
}
