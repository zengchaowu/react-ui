import type { Meta, StoryObj } from '@storybook/react'
import { TpHeroScene } from './TpHeroScene'

const meta: Meta<typeof TpHeroScene> = {
  title: '2. Third Party/3D & Graphics/TpHeroScene',
  component: TpHeroScene,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '🎮 3A游戏级别的炫酷3D场景组件，包含动态天空、太阳升起/落下、山川地形、水体等效果。基于 Three.js 构建，性能优化，支持多种画质级别。'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number' },
      description: '场景宽度（像素）',
      defaultValue: 1920
    },
    height: {
      control: { type: 'number' },
      description: '场景高度（像素）',
      defaultValue: 1080
    },
    showControls: {
      control: { type: 'boolean' },
      description: '是否显示控制面板',
      defaultValue: true
    },
    autoPlay: {
      control: { type: 'boolean' },
      description: '是否自动播放时间流逝',
      defaultValue: true
    },
    timeSpeed: {
      control: { type: 'number', min: 0.1, max: 10, step: 0.1 },
      description: '时间速度倍率',
      defaultValue: 1.0
    },
    initialTime: {
      control: { type: 'number', min: 0, max: 24, step: 0.5 },
      description: '初始时间（0-24小时）',
      defaultValue: 6
    },
    quality: {
      control: { type: 'select' },
      options: ['low', 'medium', 'high'],
      description: '画质级别',
      defaultValue: 'medium'
    },
    enablePostProcessing: {
      control: { type: 'boolean' },
      description: '是否启用后期处理',
      defaultValue: true
    },
    enableTrisolaris: {
      control: { type: 'boolean' },
      description: '启用三体系统（三个太阳）- 模拟《三体》中的恒纪元和乱纪元',
      defaultValue: false
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// 默认场景 - 篝火派对（真实3D模型）
export const Default: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 19,  // 傍晚，火光最美
    quality: 'high',
    enablePostProcessing: true,
    useRealisticModels: true,
    characterModels: [
      '/models/dance1.fbx',
      '/models/dance2.fbx',
      '/models/dance3.fbx'
    ]
  },
  parameters: {
    docs: {
      description: {
        story: '🎉 默认场景：12个真实3D角色围着篝火跳舞，包含完整的骨骼动画。傍晚时分，火光照亮星空。'
      }
    }
  }
}

// 程序化模型版本（方块人）
export const ProceduralModels: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 19,
    quality: 'high',
    enablePostProcessing: true,
    useRealisticModels: false,  // 使用程序化模型
    characterModels: []
  },
  parameters: {
    docs: {
      description: {
        story: '🎮 程序化方块人版本，类似 Minecraft 风格，不需要外部模型文件。'
      }
    }
  }
}

// 正午场景
export const Noon: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: false,
    initialTime: 12,
    quality: 'high'
  },
  parameters: {
    docs: {
      description: {
        story: '☀️ 正午时分，太阳高悬，天空湛蓝，12个角色在阳光下跳舞。'
      }
    }
  }
}

// 日落场景
export const Sunset: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: false,
    initialTime: 18,
    quality: 'medium',
    enablePostProcessing: true
  },
  parameters: {
    docs: {
      description: {
        story: '黄昏日落，夕阳西下，天空呈现橙红色。'
      }
    }
  }
}

// 夜晚场景
export const Night: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: false,
    initialTime: 22,
    quality: 'medium',
    enablePostProcessing: true
  },
  parameters: {
    docs: {
      description: {
        story: '夜幕降临，星空璀璨，月光洒满大地。'
      }
    }
  }
}

// 快速时间流逝
export const FastTime: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: true,
    timeSpeed: 5.0,
    initialTime: 0,
    quality: 'medium',
    enablePostProcessing: true
  },
  parameters: {
    docs: {
      description: {
        story: '快速时间流逝，体验一整天的日夜变化（5倍速）。'
      }
    }
  }
}

// 低画质 - 性能优先
export const LowQuality: Story = {
  args: {
    width: 1280,
    height: 720,
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 6,
    quality: 'low',
    enablePostProcessing: false
  },
  parameters: {
    docs: {
      description: {
        story: '低画质模式，适合性能较弱的设备或移动端浏览。'
      }
    }
  }
}

// 高画质 - 视觉优先
export const HighQuality: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 6,
    quality: 'high',
    enablePostProcessing: true
  },
  parameters: {
    docs: {
      description: {
        story: '高画质模式，展现最佳视觉效果，需要较强的显卡性能。'
      }
    }
  }
}

// 响应式尺寸
export const Responsive: Story = {
  args: {
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 6,
    quality: 'medium',
    enablePostProcessing: true
  },
  render: (args) => (
    <div className="w-full h-screen">
      <TpHeroScene
        {...args}
        width={1920}
        height={1080}
        containerClass="w-full h-full"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '响应式尺寸，自适应父容器大小。'
      }
    }
  }
}

// 无控制面板
export const NoControls: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: false,
    autoPlay: true,
    timeSpeed: 2.0,
    initialTime: 6,
    quality: 'medium',
    enablePostProcessing: true
  },
  parameters: {
    docs: {
      description: {
        story: '隐藏控制面板，适合作为纯背景展示。'
      }
    }
  }
}

// 使用真实3D模型
export const WithRealisticModels: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: true,
    timeSpeed: 1.0,
    initialTime: 19,
    quality: 'high',
    enablePostProcessing: true,
    useRealisticModels: true,
    characterModels: [
      '/models/dance1.fbx',
      '/models/dance2.fbx',
      '/models/dance3.fbx'
    ]
  },
  render: (args) => {
    const handleReady = () => {
      console.log('场景加载完成，支持真实3D模型')
    }

    const handleError = (error: unknown) => {
      console.error('模型加载失败，已回退到程序化模型:', error)
    }

    return (
      <div className="relative w-full h-screen">
        <TpHeroScene
          {...args}
          onReady={handleReady}
          onError={handleError}
        />

        <div className="absolute top-4 left-4 z-[var(--z-index-scene-overlay)] max-w-md rounded-lg bg-[color-mix(in_srgb,var(--warning-color-6)_90%,transparent)] p-4 text-[var(--text-color-primary)]">
          <h3 className="font-bold mb-2">💡 真实3D模型支持</h3>
          <p className="text-sm mb-2">
            要使用真实模型，请：
          </p>
          <ol className="text-xs space-y-1">
            <li>1. 访问 mixamo.com 下载带舞蹈动画的角色</li>
            <li>2. 格式选择 glTF Binary (.glb)</li>
            <li>3. 保存到项目 public/models/ 目录</li>
            <li>4. 设置 characterModels 属性为模型URL数组</li>
            <li>5. 如果模型加载失败，会自动回退到程序化模型</li>
          </ol>
          <p className="text-xs mt-2 text-[var(--text-color-secondary)]">
            当前：<span className="font-semibold">{(args.characterModels?.length ?? 0) > 0 ? '真实模型模式' : '程序化模型模式（默认）'}</span>
          </p>
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `
💎 **真实3D模型支持**

此模式支持加载专业的GLTF/GLB格式3D模型，包含：
- ✅ 自动缩放到场景合适大小
- ✅ 播放模型内置的骨骼动画
- ✅ 自动处理阴影和光照
- ✅ 循环使用多个模型（变化多样）
- ✅ 加载失败自动回退到程序化模型

**推荐资源：**
- Mixamo (mixamo.com) - 免费角色+动画 ⭐⭐⭐⭐⭐
- Sketchfab (sketchfab.com) - 海量免费模型
- Poly Pizza (poly.pizza) - 低多边形风格

**使用方法：**
\`\`\`tsx
<TpHeroScene
  useRealisticModels
  characterModels={[
    '/models/dancer1.glb',
    '/models/dancer2.glb',
  ]}
/>
\`\`\`
        `
      }
    }
  }
}

// 个人网站 Hero 场景
export const PersonalWebsiteHero: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: false,
    autoPlay: true,
    timeSpeed: 0.5,
    initialTime: 7,
    quality: 'high',
    enablePostProcessing: true
  },
  render: (args) => (
    <div className="relative w-full h-screen overflow-hidden">
      <TpHeroScene
        {...args}
        containerClass="w-full h-full"
      />

      {/* 覆盖在3D场景上的内容 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center space-y-6 px-6">
          <h1 className="text-6xl font-bold text-[var(--text-color-anti)] drop-shadow-2xl">
            Welcome to My World
          </h1>
          <p className="text-2xl text-[color-mix(in_srgb,var(--text-color-anti)_90%,transparent)] drop-shadow-lg">
            Explore the beauty of code and creativity
          </p>
          <div className="flex gap-4 justify-center pointer-events-auto mt-8">
            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-lg bg-[var(--brand-color-6)] px-8 py-3 text-[var(--text-color-anti)] shadow-2xl transition-all hover:scale-105 hover:bg-[var(--brand-color-active)]"
            >
              开始探索
            </div>
            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-lg bg-[color-mix(in_srgb,var(--text-color-anti)_20%,transparent)] px-8 py-3 text-[var(--text-color-anti)] shadow-2xl backdrop-blur-sm transition-all hover:scale-105 hover:bg-[color-mix(in_srgb,var(--text-color-anti)_30%,transparent)]"
            >
              了解更多
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '💎 个人网站 Hero 场景示例：3D背景 + 前景内容叠加，打造震撼的首页效果。'
      }
    }
  }
}

// 三体系统 - 混沌纪元
export const TrisolarisSystem: Story = {
  args: {
    width: 1920,
    height: 1080,
    showControls: true,
    autoPlay: false, // 三体系统不需要时间流逝
    timeSpeed: 1.0,
    initialTime: 12,
    quality: 'high',
    enablePostProcessing: true,
    enableTrisolaris: true, // 启用三体系统
    useRealisticModels: true,
    characterModels: [
      '/models/dance1.fbx',
      '/models/dance2.fbx',
      '/models/dance3.fbx'
    ]
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `
🌞🌞🌞 **三体系统模拟**

模拟《三体》小说中的三体世界：

- 🌟 **三个太阳**：基于简化的三体问题物理模拟，太阳之间存在引力作用
- 🔄 **混沌运动**：太阳轨迹不可预测，产生恒纪元和乱纪元
- ☀️ **恒纪元**：三个太阳运动相对稳定，气候温和，适宜生存
- ⚠️ **乱纪元**：太阳运动混乱，气候极端，文明需要脱水保存
- 🎨 **动态光照**：天空颜色根据三个太阳的位置和颜色实时变化
- 🌈 **多彩太阳**：Alpha（黄色）、Beta（橙红色）、Gamma（橙黄色）

左下角显示当前的文明纪元状态：
- **恒纪元**：气候稳定，适宜生存
- **乱纪元**：气候混乱，需要脱水

观察三个太阳如何相互影响、运动，感受三体世界的魅力！
        `
      }
    }
  }
}
