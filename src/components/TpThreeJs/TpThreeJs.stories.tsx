import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { TpThreeJs } from './TpThreeJs'

const meta: Meta<typeof TpThreeJs> = {
  title: '2. Third Party/3D & Graphics/TpThreeJs',
  component: TpThreeJs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '基于Three.js的3D场景组件，支持3D模型渲染、动画控制、相机操作等功能。',
      },
    },
  },
  argTypes: {
    width: {
      control: 'number',
      description: '容器宽度，不设置则自适应',
    },
    height: {
      control: 'number',
      description: '容器高度，默认384px',
    },
    modelScale: {
      control: { type: 'number', min: 0.01, step: 0.1 },
      description: '模型缩放',
    },
    showControls: {
      control: 'boolean',
      description: '是否显示控制面板',
    },
    autoRotate: {
      control: 'boolean',
      description: '是否自动旋转',
    },
    backgroundColor: {
      control: { type: 'color' },
      description: '背景颜色',
    },
    cameraPosition: {
      control: 'object',
      description: '相机位置',
    },
    containerClass: {
      control: 'text',
      description: '容器额外的CSS类名',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// 3D模型渲染示例
export const WithModel: Story = {
  args: {
    width: 800,
    height: 600,
    showControls: true,
    autoRotate: true,
    backgroundColor: tokenSolidColors.storyDarkBg,
    cameraPosition: { x: 0, y: 0, z: 5 },
    modelUrl:
      'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    modelScale: 1,
    enableOrbitControls: true,
    enableLights: true,
    showWireframe: false,
  },
}

// 自定义相机位置
export const CustomCameraPosition: Story = {
  args: {
    height: 384,
    showControls: true,
    autoRotate: true,
    backgroundColor: tokenSolidColors.storyDarkBg,
    cameraPosition: { x: 2, y: 2, z: 8 },
  },
}

// 网络重试机制演示
export const NetworkRetryDemo: Story = {
  args: {
    width: 800,
    height: 600,
    showControls: true,
    autoRotate: true,
    backgroundColor: tokenSolidColors.storyDarkBg,
    cameraPosition: { x: 0, y: 0, z: 5 },
    containerClass: '',
    enableOrbitControls: true,
    enableLights: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '此示例展示了 Three.js 库加载失败时的重试机制。如果网络不稳定，组件会自动重试加载，并提供手动重试按钮。',
      },
    },
  },
}
