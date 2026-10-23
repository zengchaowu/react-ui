import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwIconPicker } from './index'
import type { IconCategory } from './types'

const meta: Meta<typeof CwIconPicker> = {
  title: '1. Components/Form/CwIconPicker',
  component: CwIconPicker,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: '当前选中的图标值',
    },
    type: {
      control: 'select',
      options: ['icon', 'emoji'],
      description: '图标类型',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwIconPicker>

// 示例图标数据
const exampleCategories: IconCategory[] = [
  {
    name: '优先级',
    icons: [
      { value: 'priority-1', content: 'common--status--star-filled', type: 'asset', label: '优先级1' },
      { value: 'priority-2', content: 'common--status--star-line', type: 'asset', label: '优先级2' },
      { value: 'priority-3', content: 'common--commerce--heart-filled', type: 'asset', label: '优先级3' },
      { value: 'priority-4', content: 'common--commerce--heart-line', type: 'asset', label: '优先级4' },
      { value: 'priority-5', content: 'common--nav--notification-filled', type: 'asset', label: '优先级5' },
      { value: 'priority-6', content: 'common--nav--notification-line', type: 'asset', label: '优先级6' },
      { value: 'priority-7', content: 'common--status--info-filled', type: 'asset', label: '优先级7' },
      { value: 'priority-8', content: 'common--status--info-line', type: 'asset', label: '优先级8' },
    ],
  },
  {
    name: '进度',
    icons: [
      { value: 'progress-play', content: 'common--dir--arrow-right-line', type: 'asset', label: '播放' },
      { value: 'progress-pause', content: 'common--dir--arrow-left-line', type: 'asset', label: '暂停' },
      { value: 'progress-loading', content: 'common--action--refresh-line', type: 'asset', label: '加载中' },
      { value: 'progress-refresh', content: 'common--action--refresh-line', type: 'asset', label: '刷新' },
      { value: 'progress-done', content: 'common--status--select-line', type: 'asset', label: '完成' },
      { value: 'progress-clock', content: 'common--nav--clock-line', type: 'asset', label: '时钟' },
    ],
  },
  {
    name: '标签',
    icons: [
      { value: 'tag-thumbs-up', content: '👍', type: 'emoji', label: '点赞' },
      { value: 'tag-heart', content: '❤️', type: 'emoji', label: '爱心' },
      { value: 'tag-fire', content: '🔥', type: 'emoji', label: '火焰' },
      { value: 'tag-heart-eyes', content: '😍', type: 'emoji', label: '爱心眼' },
      { value: 'tag-grin', content: '😁', type: 'emoji', label: '大笑' },
      { value: 'tag-joy', content: '😂', type: 'emoji', label: '笑哭' },
      { value: 'tag-sunglasses', content: '😎', type: 'emoji', label: '墨镜' },
      { value: 'tag-surprised', content: '😲', type: 'emoji', label: '惊讶' },
      { value: 'tag-cry', content: '😢', type: 'emoji', label: '哭泣' },
      { value: 'tag-ghost', content: '👻', type: 'emoji', label: '幽灵' },
      { value: 'tag-party', content: '🎉', type: 'emoji', label: '庆祝' },
      { value: 'tag-clap', content: '👏', type: 'emoji', label: '鼓掌' },
    ],
  },
  {
    name: '箭头',
    icons: [
      { value: 'arrow-up', content: 'common--dir--arrow-up-line', type: 'asset', label: '向上' },
      { value: 'arrow-down', content: 'common--dir--arrow-down-line', type: 'asset', label: '向下' },
      { value: 'arrow-left', content: 'common--dir--arrow-left-line', type: 'asset', label: '向左' },
      { value: 'arrow-right', content: 'common--dir--arrow-right-line', type: 'asset', label: '向右' },
      { value: 'arrow-up-2', content: 'common--dir--arrow-up-line', type: 'asset', label: '向上2' },
      { value: 'arrow-down-2', content: 'common--dir--arrow-down-line', type: 'asset', label: '向下2' },
      { value: 'arrow-left-2', content: 'common--dir--arrow-left-line', type: 'asset', label: '向左2' },
      { value: 'arrow-right-2', content: 'common--dir--arrow-right-line', type: 'asset', label: '向右2' },
    ],
  },
  {
    name: '旗帜',
    icons: [
      { value: 'flag-cn', content: '🇨🇳', type: 'emoji', label: '中国' },
      { value: 'flag-us', content: '🇺🇸', type: 'emoji', label: '美国' },
      { value: 'flag-jp', content: '🇯🇵', type: 'emoji', label: '日本' },
      { value: 'flag-kr', content: '🇰🇷', type: 'emoji', label: '韩国' },
    ],
  },
]

function IconPickerDemo(props: ComponentProps<typeof CwIconPicker> & { showValue?: boolean }) {
  const { showValue = true, ...rest } = props
  const [value, setValue] = useState(rest.value ?? '')
  return (
    <div className="w-[37.5rem]">
      <CwIconPicker
        {...rest}
        value={value}
        onChange={setValue}
        onSelect={(val, item) => console.log('Selected:', val, item)}
        onReset={() => console.log('Reset')}
      />
      {showValue ? (
        <div className="mt-4 p-4 bg-[var(--bg-color-component)] rounded text-sm">
          <div>当前选中值: {value || '(未选择)'}</div>
        </div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: {
    value: '',
    type: 'icon',
    categories: exampleCategories,
    defaultValue: '',
    disabled: false,
  },
  render: (args) => <IconPickerDemo {...args} />,
}

export const WithDefaultValue: Story = {
  args: {
    value: 'priority-1',
    type: 'icon',
    categories: exampleCategories,
    defaultValue: 'priority-1',
    disabled: false,
  },
  render: (args) => <IconPickerDemo {...args} />,
}

export const EmojiMode: Story = {
  args: {
    value: '',
    type: 'emoji',
    categories: exampleCategories,
    defaultValue: '',
    disabled: false,
  },
  render: (args) => <IconPickerDemo {...args} />,
}

export const Disabled: Story = {
  args: {
    value: 'priority-1',
    type: 'icon',
    categories: exampleCategories,
    defaultValue: 'priority-1',
    disabled: true,
  },
  render: (args) => <IconPickerDemo {...args} showValue={false} />,
}

/** 自动展示全部 iconfont（不传 categories / 传空数组时生效） */
export const AllIconfontAuto: Story = {
  args: {
    value: '',
    type: 'icon',
    // 关键：不给 categories（或给 []）触发组件内部自动从 iconfont.css 提取全部图标
    categories: [],
    defaultValue: '',
    disabled: false,
  },
  render: (args) => (
    <div className="p-6">
      <IconPickerDemo {...args} />
      <div className="mt-4 p-3 bg-[var(--bg-color-component)] rounded text-sm">
        <div className="text-[var(--text-color-placeholder)] mt-1">
          提示：可用顶部搜索快速过滤图标
        </div>
      </div>
    </div>
  ),
}
