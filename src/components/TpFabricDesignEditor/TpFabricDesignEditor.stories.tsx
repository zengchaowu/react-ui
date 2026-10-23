import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { TpFabricDesignEditor } from './TpFabricDesignEditor'

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
  <rect x="8" y="8" width="80" height="56" fill="${tokenSolidColors.fabricEditorFillPink}" stroke="${tokenSolidColors.grayColor15}" stroke-width="2"/>
  <circle cx="150" cy="48" r="28" fill="${tokenSolidColors.fabricEditorFillCyan}" stroke="${tokenSolidColors.grayColor15}" stroke-width="2"/>
</svg>`

const meta: Meta<typeof TpFabricDesignEditor> = {
  title: '2. Third Party/Editor/TpFabricDesignEditor',
  component: TpFabricDesignEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '基于 Fabric.js 的通用画布设计编辑器：容器、形状、钢笔、图层、检查器、SVG 导入导出；画布像素尺寸随容器变化。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number' },
      description: '容器未铺开时的画布宽度回退（px）',
    },
    height: {
      control: { type: 'number' },
      description: '容器未铺开时的画布高度回退（px）',
    },
    backgroundColor: {
      control: { type: 'color' },
    },
    showToolbar: { control: 'boolean' },
    showLayersPanel: { control: 'boolean' },
    readonly: { control: 'boolean' },
    enableZoom: { control: 'boolean' },
    minZoom: { control: { type: 'number', step: 0.1 } },
    maxZoom: { control: { type: 'number', step: 0.5 } },
    fixedCanvasSize: {
      control: { type: 'number', min: 1, step: 1 },
      description: '固定逻辑画布边长（px）；也可传 { width, height } 对象',
    },
    initialSvg: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 16,
          boxSizing: 'border-box',
          height: '100vh',
          width: '100%',
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    width: 880,
    height: 620,
    backgroundColor: tokenSolidColors.white,
    showToolbar: true,
    showLayersPanel: true,
    readonly: false,
    enableZoom: true,
    minZoom: 0.05,
    maxZoom: 32,
    svgImportMode: 'replace',
  },
  render: (args) => (
    <div style={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%' }}>
      <TpFabricDesignEditor {...args} />
    </div>
  ),
}

/** 仅预览：禁用编辑与指针 */
export const Readonly: Story = {
  args: {
    ...Default.args,
    readonly: true,
    initialSvg: SAMPLE_SVG,
  },
  render: Default.render,
}

/** 隐藏图层侧栏 */
export const WithoutLayersPanel: Story = {
  args: {
    ...Default.args,
    showLayersPanel: false,
    initialSvg: SAMPLE_SVG,
  },
  render: Default.render,
}

/** 隐藏顶部工具栏（适合嵌入页内仅画布区域） */
export const WithoutToolbar: Story = {
  args: {
    ...Default.args,
    showToolbar: false,
    initialSvg: SAMPLE_SVG,
  },
  render: Default.render,
}

/** 挂载时加载示例 SVG */
export const WithInitialSvg: Story = {
  args: {
    ...Default.args,
    initialSvg: SAMPLE_SVG,
  },
  render: Default.render,
}

/** iconfont 等场景：固定 1024 逻辑画布，导出 viewBox 与之一致 */
export const FixedCanvas1024: Story = {
  args: {
    ...Default.args,
    fixedCanvasSize: 1024,
    width: 1024,
    height: 1024,
    enableZoom: false,
    initialSvg: SAMPLE_SVG,
  },
  render: Default.render,
}
