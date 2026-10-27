import type { Meta, StoryObj } from '@storybook/react'
import { CwParticleBackground } from './CwParticleBackground'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { defaultParticleColorList } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'

const meta: Meta<typeof CwParticleBackground> = {
  title: '1. Components/Visualization/CwParticleBackground',
  component: CwParticleBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '粒子背景组件，提供动态的粒子动画效果。支持鼠标交互、自定义粒子数量、颜色、连接线等配置，适用于页面背景装饰和视觉增强。',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'text' },
      description: '组件宽度，默认100%',
    },
    height: {
      control: { type: 'text' },
      description: '组件高度，默认100%',
    },
    count: {
      control: { type: 'number' },
      description: '粒子数量，0表示自动根据屏幕大小调整',
    },
    maxSize: {
      control: { type: 'number' },
      description: '粒子最大尺寸',
    },
    speed: {
      control: { type: 'number' },
      description: '粒子移动速度',
    },
    connectionRadius: {
      control: { type: 'number' },
      description: '粒子连接半径',
    },
    connectionOpacity: {
      control: { type: 'number' },
      description: '连接线透明度',
    },
    colors: {
      control: { type: 'object' },
      description: '粒子颜色数组',
    },
    className: {
      control: { type: 'text' },
      description: '自定义CSS类名',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 默认效果
export const Default: Story = {
  args: {
    width: '100%',
    height: '100vh',
    count: 0,
    maxSize: 2.5,
    speed: 0.4,
    connectionRadius: 120,
    connectionOpacity: 0.5,
    colors: [...defaultParticleColorList],
  },
  render: (args) => <CwParticleBackground {...args} />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    width: '100%',
    height: '240px',
    count: 40,
    maxSize: 2,
    speed: 0.3,
    connectionRadius: 80,
    connectionOpacity: 0.4,
    colors: [...defaultParticleColorList],
  },
  render: (args) => (
    <SlotStorySection slot="default">
      <CwParticleBackground {...args} className="rounded-lg border border-[var(--border-color)]">
        <div className="pointer-events-none flex h-full items-center justify-center">
          <p className="text-sm font-medium text-[var(--text-color-primary)]">
            前景内容（default 插槽）
          </p>
        </div>
      </CwParticleBackground>
    </SlotStorySection>
  ),
}
