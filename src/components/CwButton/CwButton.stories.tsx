import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from './CwButton'
import { CwIcon } from '../CwIcon'
import type { CwButtonType, CwButtonVariant } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwButton> = {
  title: '1. Components/Action/CwButton',
  component: CwButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwButton 统一交互按钮：type / variant / size / shape + 官方 appearance / selected；布局用原生 class。见各 Appearance* Story。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['default', 'primary', 'danger'],
      description: '按钮类型',
    },
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'ghost', 'dashed', 'text', 'overlay'],
      description: '按钮展示形态',
    },
    size: {
      control: { type: 'select' },
      options: ['compact', 'small', 'medium', 'large'],
      description: '按钮尺寸',
    },
    shape: {
      control: { type: 'select' },
      options: ['square', 'rounded', 'circle'],
      description: '按钮形状',
    },
    appearance: {
      control: { type: 'select' },
      options: [
        'default',
        'icon',
        'inline-fixed',
        'inline-padded',
        'avatar',
        'backdrop',
        'tile',
        'grid-column',
        'bar-slot',
        'list-item',
        'preset',
        'surface-light',
        'text-on-image',
        'overlay-icon',
      ],
      description: '官方外观变体',
    },
    selected: {
      control: { type: 'boolean' },
      description: '选中态（list-item / preset）',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    loading: {
      control: { type: 'boolean' },
      description: '是否展示加载状态',
    },
    texts: {
      control: false,
      description: '无障碍文本配置',
    },
    tooltip: {
      control: { type: 'text' },
      description: '悬停时显示的 Tooltip 内容',
    },
    tooltipProps: {
      control: false,
      description: 'Tooltip 额外配置（如 placement、offset）',
    },
    tooltipAppearance: {
      control: false,
      description: 'Tooltip 外观变体',
    },
    tooltipClass: {
      control: false,
      description: 'Tooltip 根节点额外 class',
    },
    tooltipTexts: {
      control: false,
      description: 'Tooltip 文本配置',
    },
    onClick: { action: 'click' },
  },
}

export default meta
type Story = StoryObj<typeof CwButton>

const buttonVariants: CwButtonVariant[] = ['solid', 'outline', 'ghost', 'dashed', 'text', 'overlay']
const buttonTypes: CwButtonType[] = ['default', 'primary', 'danger']

const variantLabels: Record<CwButtonVariant, string> = {
  solid: 'Solid',
  outline: 'Outline',
  ghost: 'Ghost',
  dashed: 'Dashed',
  text: 'Text',
  overlay: 'Overlay',
}

const typeLabels: Record<CwButtonType, string> = {
  default: '默认',
  primary: '主要',
  danger: '危险',
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

const shapes = [
  { value: 'square', label: '方形图标按钮' },
  { value: 'rounded', label: '圆角图标按钮' },
  { value: 'circle', label: '圆形图标按钮' },
] as const

export const Variants: Story = {
  args: {
    type: 'primary',
    shape: 'rounded',
    size: 'medium',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同展示形态（variant）</div>
      <div className="flex flex-wrap items-center gap-4">
        {buttonVariants.map((variant) => (
          <CwButton key={variant} {...args} variant={variant}>
            {variantLabels[variant]}
          </CwButton>
        ))}
      </div>
    </div>
  ),
}

export const Types: Story = {
  args: {
    variant: 'solid',
    shape: 'rounded',
    size: 'medium',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同类型（type）</div>
      <div className="flex flex-wrap items-center gap-4">
        {buttonTypes.map((type) => (
          <CwButton key={type} {...args} type={type}>
            {typeLabels[type]}
          </CwButton>
        ))}
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  args: {
    type: 'primary',
    variant: 'solid',
    shape: 'rounded',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((item) => (
          <CwButton key={item.value} {...args} size={item.value}>
            {item.label}
          </CwButton>
        ))}
      </div>
    </div>
  ),
}

export const Shapes: Story = {
  args: {
    type: 'primary',
    variant: 'solid',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">
        纯图标按钮（需提供 texts.label 保障可访问性）
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {shapes.map((item) => (
          <CwButton key={item.value} {...args} shape={item.value} texts={{ label: item.label }}>
            <CwIcon name="common--dir--arrow-right-line" prefix="icon" />
          </CwButton>
        ))}
      </div>
    </div>
  ),
}

export const WithTooltip: Story = {
  args: {
    type: 'primary',
    tooltip: '支持键盘和鼠标的按钮提示',
  },
  render: (args) => <CwButton {...args}>悬停查看提示</CwButton>,
}

export const DisabledAndLoading: Story = {
  args: {
    type: 'primary',
    variant: 'solid',
    shape: 'rounded',
    size: 'medium',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">禁用与加载状态</div>
      <div className="flex flex-wrap items-center gap-4">
        <CwButton {...args}>正常</CwButton>
        <CwButton {...args} disabled>
          禁用
        </CwButton>
        <CwButton {...args} loading>
          加载中
        </CwButton>
        <CwButton {...args} disabled loading>
          禁用且加载
        </CwButton>
      </div>
    </div>
  ),
}

export const IconWithText: Story = {
  args: {
    type: 'primary',
    variant: 'solid',
    size: 'medium',
    shape: 'rounded',
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">
        图标 + 文本（支持图标前置或后置）
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <CwButton {...args}>
          <CwIcon
            name="common--dir--arrow-left-line"
            prefix="icon"
            size={1}
            className="inline-flex items-center justify-center text-current"
          />
          <span className="ml-2">上一页</span>
        </CwButton>
        <CwButton {...args}>
          <span className="mr-2">下一页</span>
          <CwIcon
            name="common--dir--arrow-right-line"
            prefix="icon"
            size={1}
            className="inline-flex items-center justify-center text-current"
          />
        </CwButton>
      </div>
    </div>
  ),
}

const slotButtonArgs = {
  type: 'primary' as const,
  variant: 'solid' as const,
  shape: 'rounded' as const,
  size: 'medium' as const,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex flex-col gap-8">
      <SlotStorySection slot="default">
        <CwButton {...slotButtonArgs}>
          <CwIcon
            name="common--dir--arrow-left-line"
            prefix="icon"
            size={1}
            className="inline-flex items-center justify-center text-current"
          />
          <span className="ml-2">自定义标签</span>
        </CwButton>
      </SlotStorySection>
      <SlotStorySection slot="tooltip">
        <CwButton
          {...slotButtonArgs}
          tooltip="悬停可见默认提示"
          tooltipSlot={
            <div className="max-w-[12.5rem] px-3 py-2 text-xs leading-relaxed">
              <strong className="text-[var(--text-color-primary)]">自定义 Tooltip</strong>
              <p className="mt-1 text-[var(--text-color-secondary)]">
                通过 tooltipSlot 渲染富文本提示。
              </p>
            </div>
          }
        >
          悬停查看
        </CwButton>
      </SlotStorySection>
    </div>
  ),
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div className="relative flex h-[100vh] w-[100vw] items-center justify-center bg-[var(--scrim-base)]">
      <div className="flex align-center gap-4">
        <CwButton {...args} type="default">
          Default
        </CwButton>
        <CwButton {...args} type="primary">
          Primary
        </CwButton>
        <CwButton {...args} type="danger">
          Danger
        </CwButton>
      </div>
    </div>
  ),
}

export const AppearanceIcon: Story = {
  render: () => (
    <CwButton appearance="icon" variant="text" texts={{ label: 'icon' }}>
      <CwIcon name="common--nav--wifi-line" prefix="icon" size={1.125} />
    </CwButton>
  ),
}

export const AppearanceInlineFixed: Story = {
  render: () => (
    <CwButton appearance="inline-fixed" variant="text">
      16:42
    </CwButton>
  ),
}

export const AppearanceInlinePadded: Story = {
  render: () => (
    <CwButton appearance="inline-padded" variant="text">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-color-6)] text-xs text-white">
        A
      </span>
      <span>用户</span>
    </CwButton>
  ),
}

export const AppearanceAvatar: Story = {
  render: () => (
    <CwButton appearance="avatar" variant="text" texts={{ label: 'avatar' }}>
      <span className="flex h-full w-full items-center justify-center bg-[var(--brand-color-6)] text-xs text-white">
        A
      </span>
    </CwButton>
  ),
}

export const AppearanceBarSlot: Story = {
  render: () => (
    <CwButton appearance="bar-slot" variant="text" texts={{ label: 'dock' }}>
      <CwIcon name="common--nav--wifi-line" prefix="icon" size={1.25} />
    </CwButton>
  ),
}

export const AppearanceOverlayIcon: Story = {
  render: () => (
    <CwButton appearance="overlay-icon" variant="text" shape="circle" texts={{ label: '关闭' }}>
      ×
    </CwButton>
  ),
}

export const AppearanceListItem: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <CwButton appearance="list-item" variant="text">
        列表项
      </CwButton>
      <CwButton appearance="list-item" variant="text" selected>
        列表项（选中）
      </CwButton>
    </div>
  ),
}

export const AppearancePreset: Story = {
  render: () => (
    <div className="flex gap-2">
      <CwButton appearance="preset" variant="text">
        预设
      </CwButton>
      <CwButton appearance="preset" variant="text" selected>
        预设（选中）
      </CwButton>
    </div>
  ),
}

export const AppearanceTile: Story = {
  render: () => (
    <CwButton appearance="tile" variant="text">
      <span className="text-2xl">□</span>
      <span>磁贴</span>
    </CwButton>
  ),
}

export const AppearanceGridColumn: Story = {
  render: () => (
    <CwButton appearance="grid-column" variant="text">
      <span className="text-2xl">▣</span>
      <span>桌面图标</span>
    </CwButton>
  ),
}

export const AppearanceBackdrop: Story = {
  render: () => (
    <div className="relative h-16 w-64 overflow-hidden rounded-lg border border-[var(--border-color)]">
      <CwButton appearance="backdrop" variant="text" texts={{ label: 'backdrop' }} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[var(--text-color-secondary)]">
        backdrop 透明层
      </span>
    </div>
  ),
}

export const AppearanceSurfaceLight: Story = {
  render: () => (
    <div className="rounded-lg bg-[var(--scrim-base)] p-4">
      <CwButton appearance="surface-light" shape="circle" texts={{ label: '登录' }}>
        登录
      </CwButton>
    </div>
  ),
}

export const AppearanceTextOnImage: Story = {
  render: () => (
    <div className="rounded-lg bg-[var(--scrim-base)] p-4">
      <CwButton appearance="text-on-image" variant="text">
        关机
      </CwButton>
    </div>
  ),
}

const inlineBarIconStyles = {
  className: 'inline-flex items-center justify-center text-current',
  size: 1.25,
} as const

export const InlineBar: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '深底顶栏场景：`overlay` 用于带描边的面板按钮（如「应用」）；`text` + `compact` 用于托盘图标/时钟等无边框控件。颜色均来自 `--button-overlay-*` / `--button-neutral-overlay-*` token。',
      },
    },
  },
  render: () => (
    <div className="flex h-9 w-full items-center justify-between border-b border-[var(--overlay-scrim-soft)] bg-[var(--overlay-scrim-panel)] px-3 text-[var(--text-color-primary)]">
      <div className="flex items-center gap-2">
        <CwButton variant="overlay" size="compact">
          应用
        </CwButton>
        <span className="text-sm opacity-70">Workspace</span>
      </div>
      <div className="flex items-center gap-1.5">
        <CwButton appearance="icon" variant="text" texts={{ label: '网络' }}>
          <CwIcon
            name="common--nav--wifi-line"
            prefix="icon"
            size={inlineBarIconStyles.size ?? 1}
            className={inlineBarIconStyles.className}
          />
        </CwButton>
        <CwButton appearance="inline-fixed" variant="text">
          16:42
        </CwButton>
      </div>
    </div>
  ),
}
