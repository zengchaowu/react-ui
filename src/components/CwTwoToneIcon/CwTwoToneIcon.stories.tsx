import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { CwTwoToneIcon } from './CwTwoToneIcon'

/** Story 内使用的两个示例 symbol id（见下方 defs），与 iconfont 无关，仅用于演示双色叠合 */
const DEMO_PRIMARY = 'cw-two-tone-demo-primary'
const DEMO_ACCENT = 'cw-two-tone-demo-accent'

const meta: Meta<typeof CwTwoToneIcon> = {
  title: '1. Components/Display/CwTwoToneIcon',
  component: CwTwoToneIcon,
  parameters: {
    docs: {
      description: {
        component:
          '双色图标：由两个 SVG symbol 叠合，分别设置主色和强调色。需在页面中提供 symbol（如 iconfont 导出的 symbol sprite），且 symbol 内 fill 使用 currentColor 或留空以便继承。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    primaryName: { control: 'text', description: '底层图标 symbol id' },
    accentName: { control: 'text', description: '上层图标 symbol id' },
    primaryColor: { control: 'text', description: '主色 CSS 值' },
    accentColor: { control: 'text', description: '强调色 CSS 值' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const wrapIcon = (icon: React.ReactNode) => (
  <div>
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <symbol id={DEMO_PRIMARY} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </symbol>
        <symbol id={DEMO_ACCENT} viewBox="0 0 24 24">
          <path d="M12 4l-2 8h4l-2 8" fill="currentColor" />
        </symbol>
      </defs>
    </svg>
    {icon}
  </div>
)

export const Default: Story = {
  args: {
    primaryName: DEMO_PRIMARY,
    accentName: DEMO_ACCENT,
    primaryColor: 'var(--text-color-secondary)',
    accentColor: 'var(--brand-color-6)',
  },
  render: (args) => {
    const { primaryName, accentName, ...rest } = args
    return wrapIcon(
      <CwTwoToneIcon
        primaryName={primaryName ?? DEMO_PRIMARY}
        accentName={accentName ?? DEMO_ACCENT}
        {...rest}
        style={{ fontSize: '48px' }}
      />,
    )
  },
}

export const CustomColors: Story = {
  args: {
    primaryName: DEMO_PRIMARY,
    accentName: DEMO_ACCENT,
    primaryColor: tokenSolidColors.storyDemoSlate,
    accentColor: tokenSolidColors.storyDemoOrange,
  },
  render: (args) => {
    const { primaryName, accentName, ...rest } = args
    return wrapIcon(
      <CwTwoToneIcon
        primaryName={primaryName ?? DEMO_PRIMARY}
        accentName={accentName ?? DEMO_ACCENT}
        {...rest}
        style={{ fontSize: '48px' }}
      />,
    )
  },
}
