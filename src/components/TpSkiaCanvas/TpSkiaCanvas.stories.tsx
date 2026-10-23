import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { TpSkiaCanvas } from './TpSkiaCanvas'

const meta: Meta<typeof TpSkiaCanvas> = {
  title: '2. Third Party/Editor/TpSkiaCanvas',
  component: TpSkiaCanvas,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '基于 Skia 的高性能画布组件，支持自定义绘制函数和高分辨率显示。适用于复杂的图形绘制、数据可视化、游戏开发等场景。',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'number' },
      description: '画布宽度',
    },
    height: {
      control: { type: 'number' },
      description: '画布高度',
    },
    pixelRatio: {
      control: { type: 'number', min: 0.5, max: 3, step: 0.1 },
      description: '像素比例，用于高分辨率支持',
    },
    backgroundColor: {
      control: { type: 'color' },
      description: '背景色',
    },
    autoRedraw: {
      control: { type: 'boolean' },
      description: '是否自动重绘',
    },
  },
}

export default meta
type Story = StoryObj<typeof TpSkiaCanvas>

// 基础示例 - 绘制简单图形
export const Default: Story = {
  args: {
    width: 400,
    height: 300,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.storyCanvasMuted,
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.storyCanvasMuted
      ctx.fillRect(0, 0, width, height)

      // 绘制矩形
      ctx.fillStyle = tokenSolidColors.brandColor6
      ctx.fillRect(50, 50, 100, 80)

      // 绘制圆形
      ctx.fillStyle = tokenSolidColors.errorColor6
      ctx.beginPath()
      ctx.arc(250, 90, 40, 0, Math.PI * 2)
      ctx.fill()

      // 绘制文字
      ctx.fillStyle = tokenSolidColors.grayColor15
      ctx.font = '16px Arial'
      ctx.fillText('Hello Skia Canvas!', 50, 200)
    },
  },
}

// 高分辨率示例
export const HighResolution: Story = {
  args: {
    width: 400,
    height: 300,
    pixelRatio: 2,
    backgroundColor: tokenSolidColors.white,
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, width, height)

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, tokenSolidColors.storyGradientPurpleStart)
      gradient.addColorStop(1, tokenSolidColors.storyGradientPurpleEnd)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // 绘制多个圆形
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 30 + 10
        const hue = Math.random() * 360

        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  },
}

// 动画示例
export const Animation: Story = {
  args: {
    width: 400,
    height: 300,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.black,
    animate: async (ctx, width, height, elapsed) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.black
      ctx.fillRect(0, 0, width, height)

      // 绘制动态星空效果
      for (let i = 0; i < 50; i++) {
        const x = Math.sin(elapsed * 0.5 + i * 0.1) * 50 + width / 2
        const y = Math.cos(elapsed * 0.3 + i * 0.15) * 30 + height / 2
        const size = Math.sin(elapsed * 2 + i) * 1 + 1.5
        const alpha = Math.sin(elapsed * 3 + i * 0.2) * 0.5 + 0.5

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // 绘制旋转的月亮
      const moonX = width - 80
      const moonY = 60
      const moonRadius = 30
      const rotation = elapsed * 0.5

      ctx.save()
      ctx.translate(moonX, moonY)
      ctx.rotate(rotation)
      ctx.fillStyle = tokenSolidColors.warningColor5
      ctx.beginPath()
      ctx.arc(0, 0, moonRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    },
  },
}

// 交互式绘图示例
export const InteractiveDrawing: Story = {
  args: {
    width: 400,
    height: 300,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.bgColorPage,
    autoRedraw: false, // 关闭自动重绘，手动控制
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.bgColorPage
      ctx.fillRect(0, 0, width, height)

      // 绘制网格
      ctx.strokeStyle = tokenSolidColors.borderColorLight
      ctx.lineWidth = 0.5
      for (let i = 0; i <= width; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      for (let i = 0; i <= height; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }

      // 绘制中心圆
      ctx.fillStyle = tokenSolidColors.brandColor6
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2)
      ctx.fill()

      // 绘制装饰性元素
      ctx.strokeStyle = tokenSolidColors.storyGradientPurpleEnd
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const x1 = width / 2 + Math.cos(angle) * 60
        const y1 = height / 2 + Math.sin(angle) * 60
        const x2 = width / 2 + Math.cos(angle) * 80
        const y2 = height / 2 + Math.sin(angle) * 80

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    },
    onMouseDown: (ctx, x, y) => {
      console.log('onMouseDown called with:', { x, y })
      // 在鼠标按下位置绘制一个圆
      ctx.fillStyle = tokenSolidColors.errorColor6
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
    },
    onMouseMove: (ctx, x, y) => {
      // 在鼠标移动时绘制轨迹
      ctx.strokeStyle = tokenSolidColors.successColor6
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.stroke()
    },
  },
}

// 画笔工具示例
export const BrushTool: Story = {
  args: {
    width: 500,
    height: 400,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.white,
    autoRedraw: false,
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, width, height)

      // 绘制说明文字
      ctx.fillStyle = tokenSolidColors.grayColor15
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('拖拽鼠标绘制', width / 2, 30)
    },
    onMouseDown: (ctx, x, y) => {
      // 开始绘制路径
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.strokeStyle = tokenSolidColors.brandColor6
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    },
    onMouseMove: (ctx, x, y) => {
      // 继续绘制路径（只有在按下时才绘制）
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    onMouseUp: (ctx) => {
      // 结束绘制路径
      ctx.closePath()
    },
  },
}

// 简单交互测试示例
export const SimpleInteraction: Story = {
  args: {
    width: 300,
    height: 200,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.white,
    autoRedraw: false, // 关闭自动重绘
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, width, height)

      // 绘制边框
      ctx.strokeStyle = tokenSolidColors.black
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, width, height)

      // 绘制说明文字
      ctx.fillStyle = tokenSolidColors.textColorMuted
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('点击画布测试交互', width / 2, height / 2)
    },
    onMouseDown: (ctx, x, y) => {
      console.log('Simple interaction - Mouse down at:', { x, y })
      // 绘制一个红色圆
      ctx.fillStyle = tokenSolidColors.errorColor6
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()
    },
  },
}

// 真正的画笔工具示例
export const RealBrushTool: Story = {
  args: {
    width: 600,
    height: 400,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.white,
    autoRedraw: false,
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, width, height)

      // 绘制说明文字
      ctx.fillStyle = tokenSolidColors.grayColor15
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('按住鼠标拖拽绘制', width / 2, 30)
      ctx.font = '14px Arial'
      ctx.fillText('鼠标按下开始，移动绘制，松开结束', width / 2, 50)
    },
    onMouseDown: (ctx, x, y) => {
      // 开始绘制路径
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.strokeStyle = tokenSolidColors.brandColor6
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    },
    onMouseMove: (ctx, x, y) => {
      // 继续绘制路径（只有在按下时才绘制）
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    onMouseUp: (ctx) => {
      // 结束绘制路径
      ctx.closePath()
    },
  },
}

// 粒子系统动画示例
export const ParticleSystem: Story = {
  args: {
    width: 500,
    height: 400,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.storyNightBg,
    animate: async (ctx, width, height, elapsed) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.storyNightBg
      ctx.fillRect(0, 0, width, height)

      // 粒子系统
      const particleCount = 100
      const centerX = width / 2
      const centerY = height / 2

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + elapsed * 0.5
        const radius = 50 + Math.sin(elapsed * 2 + i * 0.1) * 30
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        // 粒子大小和透明度
        const size = Math.sin(elapsed * 3 + i * 0.2) * 2 + 3
        const alpha = Math.sin(elapsed * 4 + i * 0.3) * 0.5 + 0.5

        // 颜色渐变
        const hue = (elapsed * 50 + i * 3.6) % 360
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // 中心发光效果
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2)
      ctx.fill()
    },
  },
}

// 波形动画示例
export const WaveAnimation: Story = {
  args: {
    width: 600,
    height: 300,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.storyNightPanel,
    animate: async (ctx, width, height, elapsed) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.storyNightPanel
      ctx.fillRect(0, 0, width, height)

      // 绘制多个波形
      const waveCount = 3
      const colors = [
        tokenSolidColors.brandColor6,
        tokenSolidColors.storyGradientPurpleEnd,
        tokenSolidColors.errorColor6,
      ]

      for (let wave = 0; wave < waveCount; wave++) {
        ctx.strokeStyle = colors[wave]
        ctx.lineWidth = 3
        ctx.beginPath()

        const frequency = 0.02 + wave * 0.01
        const amplitude = 30 + wave * 20
        const phase = (elapsed * 2 + (wave * Math.PI) / 3)

        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // 添加粒子效果
      for (let i = 0; i < 20; i++) {
        const x = (elapsed * 50 + i * 30) % width
        const y = height / 2 + Math.sin(x * 0.02 + elapsed * 2) * 50
        const size = Math.sin(elapsed * 5 + i) * 2 + 3

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(elapsed * 3 + i) * 0.5 + 0.5})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  },
}

// 数据可视化示例
export const DataVisualization: Story = {
  args: {
    width: 500,
    height: 350,
    pixelRatio: 1,
    backgroundColor: tokenSolidColors.white,
    draw: async (ctx, width, height) => {
      // 设置背景
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, width, height)

      // 模拟数据
      const data = [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 90]
      const labels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]

      const chartWidth = width - 80
      const chartHeight = height - 80
      const barWidth = chartWidth / data.length
      const maxValue = Math.max(...data)

      // 绘制坐标轴
      ctx.strokeStyle = tokenSolidColors.storyChartGrid
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, 20)
      ctx.lineTo(40, chartHeight + 20)
      ctx.lineTo(chartWidth + 40, chartHeight + 20)
      ctx.stroke()

      // 绘制柱状图
      data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = 40 + index * barWidth + barWidth * 0.1
        const y = chartHeight + 20 - barHeight
        const w = barWidth * 0.8

        // 柱状图颜色
        const hue = (index / data.length) * 360
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fillRect(x, y, w, barHeight)

        // 标签
        ctx.fillStyle = tokenSolidColors.storyChartText
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(labels[index], x + w / 2, chartHeight + 40)
      })

      // 标题
      ctx.fillStyle = tokenSolidColors.grayColor15
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Monthly Sales Data', width / 2, 15)
    },
  },
}
