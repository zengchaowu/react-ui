import type { Meta, StoryObj } from '@storybook/react'
import CwGrid from '../CwGrid/CwGrid'
import { CwIcon } from './CwIcon'

const meta: Meta<typeof CwIcon> = {
  title: '1. Components/Display/CwIcon',
  component: CwIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '统一的 iconfont 图标组件，支持字体与 Symbol 多色模式。',
      },
    },
  },
  argTypes: {
    name: {
      control: { type: 'text' },
      description:
        'iconfont 图标类名（如 "common--nav--home-line" 或 "icon-common--nav--home-line"）',
    },
    spin: {
      control: { type: 'boolean' },
      description: '是否旋转（用于加载动画）',
    },
    prefix: {
      control: { type: 'text' },
      description: '图标前缀（用于 iconfont）',
    },
    size: {
      control: { type: 'number' },
      description: '边长 rem（0 = 由外层 CSS/em 承担）',
    },
    mode: {
      control: { type: 'select' },
      options: ['font', 'symbol'],
      description: '渲染模式：font 单色 / symbol 多色',
    },
    texts: {
      control: false,
      description: '自定义文案',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwIcon>

export const Default: Story = {
  args: {
    name: 'common--nav--home-line',
    prefix: 'icon',
    size: 2,
    spin: false,
    mode: 'font',
  },
  render: (args) => (
    <CwIcon
      {...args}
      className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
    />
  ),
}

// iconfont 图标展示
export const Iconfont: Story = {
  render: () => {
    const icons = [
      { name: 'common--user--user-line', label: '用户' },
      { name: 'common--dir--arrow-down-line', label: '向下' },
      { name: 'common--dir--arrow-right-line', label: '向右' },
      { name: 'common--nav--clock-line', label: '时钟' },
      { name: 'common--action--search-line', label: '搜索' },
      { name: 'common--user--phone-circle-line', label: '电话' },
      { name: 'common--dir--arrow-right-line', label: '右箭头' },
      { name: 'common--nav--home-line', label: '首页' },
      { name: 'common--user--user-filled', label: '用户填充' },
    ]
    return (
      <div className="flex w-[40rem] max-w-full flex-col items-center gap-4 p-8">
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">iconfont 图标</div>
        <CwGrid className="w-full" columns={3} gutter={24} rowGap={24} align="top">
          {icons.map((icon) => (
            <div
              key={icon.label}
              className="flex w-full min-w-0 flex-col items-center gap-2"
            >
              <CwIcon
                name={icon.name}
                prefix="icon"
                size={2}
                className="inline-flex shrink-0 items-center justify-center text-[var(--brand-color-6)]"
              />
              <span className="text-xs text-[var(--text-color-secondary)]">{icon.label}</span>
              <span
                className="w-full truncate text-center text-[0.625rem] text-[var(--text-color-placeholder)]"
                title={`icon-${icon.name}`}
              >
                icon-{icon.name}
              </span>
            </div>
          ))}
        </CwGrid>
      </div>
    )
  },
}

// 样式变化（尺寸和颜色）
export const StyleVariants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6 p-8">
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-3">不同尺寸</div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--action--search-line"
              prefix="icon"
              size={1}
              className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            />
            <span className="text-xs">16px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--action--search-line"
              prefix="icon"
              size={1.5}
              className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            />
            <span className="text-xs">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--action--search-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            />
            <span className="text-xs">32px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--action--search-line"
              prefix="icon"
              size={3}
              className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            />
            <span className="text-xs">48px</span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-3">不同颜色</div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--user--phone-circle-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            />
            <span className="text-xs">品牌色</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--user--phone-circle-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--success-color-6)]"
            />
            <span className="text-xs">成功色</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--user--phone-circle-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--warning-color-6)]"
            />
            <span className="text-xs">警告色</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CwIcon
              name="common--user--phone-circle-line"
              prefix="icon"
              size={2}
              className="inline-flex items-center justify-center text-[var(--error-color-6)]"
            />
            <span className="text-xs">错误色</span>
          </div>
        </div>
      </div>
    </div>
  ),
}

// 旋转功能
export const Rotate: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-sm text-[var(--text-color-secondary)] mb-2">旋转功能</div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={2}
            className="inline-flex items-center justify-center text-[var(--brand-color-6)]"
            spin
          />
          <span className="text-xs">旋转动画</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={2}
            className="inline-flex items-center justify-center text-[var(--brand-color-6)] rotate-90"
          />
          <span className="text-xs">旋转 90°</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={2}
            className="inline-flex items-center justify-center text-[var(--brand-color-6)] rotate-180"
          />
          <span className="text-xs">旋转 180°</span>
        </div>
      </div>
    </div>
  ),
}
