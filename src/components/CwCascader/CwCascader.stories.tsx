import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCascader } from './CwCascader'
import type { CwCascaderOption, CwCascaderProps } from './types'

const meta: Meta<typeof CwCascader> = {
  title: '1. Components/Form/CwCascader',
  component: CwCascader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '基于 CwInput 与 CwPopup 实现的级联选择组件，支持键盘与聚焦规范。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: { type: 'text' } },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    clearable: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '级联选择器尺寸',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwCascader>

const options: CwCascaderOption[] = [
  {
    label: '浙江省',
    value: 'zj',
    children: [
      {
        label: '杭州',
        value: 'hz',
        children: [
          { label: '西湖区', value: 'xh' },
          { label: '滨江区', value: 'bj' },
          { label: '上城区', value: 'sc' },
          { label: '下城区', value: 'xc' },
          { label: '江干区', value: 'jg' },
        ],
      },
      {
        label: '宁波',
        value: 'nb',
        children: [
          { label: '鄞州区', value: 'yz' },
          { label: '海曙区', value: 'hs' },
          { label: '江北区', value: 'jb' },
        ],
      },
      {
        label: '温州',
        value: 'wz',
        children: [
          { label: '鹿城区', value: 'lc' },
          { label: '龙湾区', value: 'lw' },
        ],
      },
      {
        label: '嘉兴',
        value: 'jx',
        children: [{ label: '南湖区', value: 'nh' }],
      },
    ],
  },
  {
    label: '江苏省',
    value: 'js',
    children: [
      {
        label: '南京',
        value: 'nj',
        children: [
          { label: '玄武区', value: 'xw' },
          { label: '秦淮区', value: 'qh' },
          { label: '建邺区', value: 'jy' },
          { label: '鼓楼区', value: 'gl' },
        ],
      },
      {
        label: '苏州',
        value: 'sz',
        children: [
          { label: '姑苏区', value: 'gs' },
          { label: '虎丘区', value: 'hq' },
          { label: '工业园区', value: 'gyyq' },
        ],
      },
      {
        label: '无锡',
        value: 'wx',
        children: [
          { label: '梁溪区', value: 'lx' },
          { label: '锡山区', value: 'xs' },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: 'gd',
    children: [
      {
        label: '广州',
        value: 'gz',
        children: [
          { label: '天河区', value: 'th' },
          { label: '越秀区', value: 'yx' },
          { label: '荔湾区', value: 'lw' },
          { label: '海珠区', value: 'hz' },
          { label: '白云区', value: 'by' },
        ],
      },
      {
        label: '深圳',
        value: 'sz',
        children: [
          { label: '南山区', value: 'ns' },
          { label: '福田区', value: 'ft' },
          { label: '罗湖区', value: 'lh' },
        ],
      },
      {
        label: '东莞',
        value: 'dg',
        children: [{ label: '莞城区', value: 'gc' }],
      },
    ],
  },
  {
    label: '山东省',
    value: 'sd',
    children: [
      {
        label: '济南',
        value: 'jn',
        children: [
          { label: '历下区', value: 'lx' },
          { label: '市中区', value: 'sz' },
        ],
      },
      {
        label: '青岛',
        value: 'qd',
        children: [
          { label: '市南区', value: 'sn' },
          { label: '市北区', value: 'sb' },
        ],
      },
    ],
  },
]

const deepOptions: CwCascaderOption[] = [
  {
    label: 'Level 1 - A',
    value: 'l1a',
    children: [
      {
        label: 'Level 2 - A1',
        value: 'l2a1',
        children: [
          {
            label: 'Level 3 - A1-1',
            value: 'l3a11',
            children: [
              { label: 'Level 4 - A1-1-1', value: 'l4a111' },
              { label: 'Level 4 - A1-1-2', value: 'l4a112' },
              { label: 'Level 4 - A1-1-3', value: 'l4a113' },
            ],
          },
          {
            label: 'Level 3 - A1-2',
            value: 'l3a12',
            children: [{ label: 'Level 4 - A1-2-1', value: 'l4a121' }],
          },
        ],
      },
      {
        label: 'Level 2 - A2',
        value: 'l2a2',
        children: [
          { label: 'Level 3 - A2-1', value: 'l3a21' },
          { label: 'Level 3 - A2-2', value: 'l3a22' },
        ],
      },
    ],
  },
  {
    label: 'Level 1 - B',
    value: 'l1b',
    children: [
      {
        label: 'Level 2 - B1',
        value: 'l2b1',
        children: [{ label: 'Level 3 - B1-1', value: 'l3b11' }],
      },
      { label: 'Level 2 - B2', value: 'l2b2' },
    ],
  },
  {
    label: 'Level 1 - C',
    value: 'l1c',
    children: [
      {
        label: 'Level 2 - C1',
        value: 'l2c1',
        children: [
          {
            label: 'Level 3 - C1-1',
            value: 'l3c11',
            children: [
              { label: 'Level 4 - C1-1-1', value: 'l4c111' },
              { label: 'Level 4 - C1-1-2', value: 'l4c112' },
            ],
          },
        ],
      },
    ],
  },
]

const disabledOptions: CwCascaderOption[] = [
  {
    label: '水果',
    value: 'fruit',
    children: [
      { label: '苹果', value: 'apple', disabled: true },
      { label: '香蕉', value: 'banana' },
      { label: '橙子', value: 'orange', disabled: true },
    ],
  },
  {
    label: '蔬菜',
    value: 'vegetable',
    disabled: true,
    children: [
      { label: '胡萝卜', value: 'carrot' },
      { label: '土豆', value: 'potato' },
    ],
  },
  {
    label: '肉类',
    value: 'meat',
    children: [
      { label: '牛肉', value: 'beef' },
      { label: '鸡肉', value: 'chicken', disabled: true },
      { label: '猪肉', value: 'pork' },
    ],
  },
]

// 生成每列至少 12 项的长列表数据
function generateLongOptions(levels = 3, itemsPerLevel = 12, prefix = 'L'): CwCascaderOption[] {
  const makeLevel = (level: number): CwCascaderOption[] => {
    return Array.from({ length: itemsPerLevel }, (_, i) => {
      const label = `${prefix}${level + 1}-${i + 1}`
      const value = `${prefix.toLowerCase()}${level + 1}_${i + 1}`
      const hasChildren = level < levels - 1
      return {
        label,
        value,
        children: hasChildren ? makeLevel(level + 1) : undefined,
      }
    })
  }
  return makeLevel(0)
}

const longOptions: CwCascaderOption[] = generateLongOptions(3, 12, 'N')

const regionOptions: CwCascaderOption[] = [
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

type CascaderValue = NonNullable<CwCascaderProps['value']>

function ControlledCascader({
  initialValue,
  ...args
}: Omit<Partial<CwCascaderProps>, 'value'> & { initialValue: CascaderValue }) {
  const [value, setValue] = useState<CascaderValue>(initialValue)
  return <CwCascader {...args} value={value} onChange={setValue} />
}

type CascaderSizesDemoProps = Pick<CwCascaderProps, 'clearable'>

function CascaderSizesDemo(props: CascaderSizesDemoProps) {
  const sizes = [
    { value: 'small', label: '小号' },
    { value: 'medium', label: '中号' },
    { value: 'large', label: '大号' },
  ] as const
  const [smallValue, setSmallValue] = useState<CascaderValue>(['zj', 'hz', 'xh'])
  const [mediumValue, setMediumValue] = useState<CascaderValue>(['zj', 'hz', 'xh'])
  const [largeValue, setLargeValue] = useState<CascaderValue>(['zj', 'hz', 'xh'])
  const values = { small: smallValue, medium: mediumValue, large: largeValue }
  const setters = { small: setSmallValue, medium: setMediumValue, large: setLargeValue }
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value}>
            <div className="mb-2 text-xs text-[var(--text-color-secondary)]">{item.label}</div>
            <CwCascader
              {...props}
              options={options}
              size={item.value}
              value={values[item.value]}
              onChange={(next) => setters[item.value](next)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const States: Story = {
  args: { clearable: true },
  render: (args) => (
    <div>
      <ControlledCascader {...args} options={options} initialValue={['zj', 'hz', 'xh']} />
    </div>
  ),
}

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => (
    <div>
      <ControlledCascader {...args} options={options} initialValue={['zj', 'hz', 'xh']} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div>
      <ControlledCascader {...args} options={options} initialValue={['zj', 'hz', 'xh']} />
    </div>
  ),
}

export const Clearable: Story = {
  args: { clearable: true },
  render: (args) => (
    <div>
      <ControlledCascader {...args} options={options} initialValue={['zj', 'hz', 'xh']} />
    </div>
  ),
}

export const DeepData: Story = {
  render: (args) => (
    <div>
      <ControlledCascader
        {...args}
        options={deepOptions}
        initialValue={['l1a', 'l2a1', 'l3a11', 'l4a111']}
      />
    </div>
  ),
}

export const WithDisabled: Story = {
  render: (args) => (
    <div>
      <ControlledCascader {...args} options={disabledOptions} initialValue={['fruit', 'banana']} />
    </div>
  ),
}

export const LongList: Story = {
  render: (args) => (
    <div>
      <ControlledCascader
        {...args}
        options={longOptions}
        initialValue={['n1_12', 'n2_10', 'n3_8']}
      />
    </div>
  ),
}

export const Sizes: Story = {
  args: {
    clearable: true,
  },
  render: (args) => <CascaderSizesDemo {...args} />,
}

