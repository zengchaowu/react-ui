import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { TpVueFlow } from './TpVueFlow'

const meta: Meta<typeof TpVueFlow> = {
  title: '2. Third Party/Diagram/TpVueFlow',
  component: TpVueFlow,
  parameters: {
    layout: 'fullscreen',
    controls: {
      exclude: /^(texts|nodeTypes|nodes|edges)$/,
    },
    docs: {
      description: {
        component: '简化版Vue Flow流程图组件，支持节点连线和小地图功能。',
      },
    },
  },
  argTypes: {
    texts: {
      control: false,
      description: '自定义文本对象',
    },
    showMinimap: {
      control: 'boolean',
      description: '是否显示小地图',
    },
    showControls: {
      control: 'boolean',
      description: '是否显示控制面板',
    },
    showBackground: {
      control: 'boolean',
      description: '是否显示背景',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用组件',
    },
    nodeTypes: {
      control: false,
      description: '自定义节点类型',
    },
    nodes: {
      control: false,
      description: '流程图节点数据',
    },
    edges: {
      control: false,
      description: '流程图连线数据',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// 自定义节点示例
export const CustomNodes: Story = {
  args: {
    showMinimap: true,
    showControls: true,
    showBackground: true,
    disabled: false,
    nodes: [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 50 },
        data: {
          label: '矩形节点',
          description: '这是一个矩形节点示例',
        },
      },
      {
        id: '2',
        type: 'circle',
        position: { x: 350, y: 50 },
        data: {
          label: '圆形节点',
          color: tokenSolidColors.storyVueFlowEdge,
        },
      },
      {
        id: '3',
        type: 'menu',
        position: { x: 200, y: 200 },
        data: {
          label: '菜单节点',
          menuItems: [
            { id: 'item1', label: '选项 1' },
            { id: 'item2', label: '选项 2' },
            { id: 'item3', label: '选项 3' },
          ],
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },
  render: (args) => (
    <div className="w-full h-[100vh]">
      <TpVueFlow nodes={args.nodes ?? []} edges={args.edges ?? []} {...args} />
    </div>
  ),
}

