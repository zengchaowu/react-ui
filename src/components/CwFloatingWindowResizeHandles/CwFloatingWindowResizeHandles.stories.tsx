import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type {
  FloatingWindowBounds,
  FloatingWindowResizeEdge,
} from '@zengchaowu/shared/functions/ui/floatingWindowGeometry'
import { useCwFloatingWindowChrome } from '../../hooks/useCwFloatingWindowChrome'
import CwWindowTitleBar from '../CwWindowTitleBar/CwWindowTitleBar'
import CwFloatingWindowShell from '../CwFloatingWindowShell/CwFloatingWindowShell'
import { CwFloatingWindowResizeHandles } from './CwFloatingWindowResizeHandles'
import './CwFloatingWindowResizeHandles.stories.css'

const meta: Meta<typeof CwFloatingWindowResizeHandles> = {
  title: '1. Components/Layout/CwFloatingWindowResizeHandles',
  component: CwFloatingWindowResizeHandles,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '浮窗八个边和角的缩放热区。按下后把 edge 交给外部，由外部改窗口的 x / y / width / height。最大化或最小化时隐藏。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    visible: {
      control: { type: 'boolean' },
      description: '是否显示缩放热区（最大化时 Story 内仍会隐藏）',
    },
  },
  args: {
    visible: true,
  },
}

export default meta
type Story = StoryObj<typeof CwFloatingWindowResizeHandles>

type ShellMode = 'normal' | 'minimized' | 'maximized'

function ResizeHandlesDemo({ visible }: { visible?: boolean }) {
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null)
  const [mode, setMode] = useState<ShellMode>('normal')
  const [bounds, setBounds] = useState<FloatingWindowBounds>({
    x: 72,
    y: 72,
    width: 320,
    height: 200,
  })
  const [lastEdge, setLastEdge] = useState<FloatingWindowResizeEdge | ''>('')

  const { gestureActive, onTitlePointerDown, onResizePointerDown } = useCwFloatingWindowChrome({
    bounds,
    mode,
    onBoundsChange: setBounds,
    getConstraints: () => ({
      minWidth: 220,
      minHeight: 140,
      layerWidth: stageEl?.clientWidth ?? 800,
      layerHeight: stageEl?.clientHeight ?? 560,
      insetTop: 0,
      insetBottom: 0,
    }),
  })

  const shellStyle =
    mode === 'maximized'
      ? { left: '0px', top: '0px', width: '100%', height: '100%' }
      : {
          left: `${bounds.x}px`,
          top: `${bounds.y}px`,
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
        }

  const toggleMaximize = () => {
    setMode((prev) => (prev === 'maximized' ? 'normal' : 'maximized'))
  }

  return (
    <div
      ref={setStageEl}
      className="cw-floating-window-story relative h-[36rem] w-full overflow-hidden bg-[var(--bg-color-page)]"
    >
      <p className="pointer-events-none absolute left-4 top-3 z-[var(--z-index-above)] max-w-[24rem] text-xs leading-relaxed text-[var(--text-color-secondary)]">
        蓝色条是八个缩放热区。按住边或角拖动，窗口会改宽高；最大化后热区隐藏。 Controls 的
        visible 仅在 normal 模式下生效，最大化时仍会隐藏热区。
      </p>
      <CwFloatingWindowShell
        maximized={mode === 'maximized'}
        noTransition={gestureActive}
        gestureActive={gestureActive}
        style={shellStyle}
      >
        <CwWindowTitleBar
          mode="mac"
          title="缩放"
          showTitle
          appearance="fixed-height"
          maximized={mode === 'maximized'}
          closable={false}
          minimizable={false}
          onDragPointerDown={onTitlePointerDown}
          onMaximize={toggleMaximize}
          onDoubleClick={toggleMaximize}
        />
        <div className="min-h-0 flex-1 p-4 text-sm text-[var(--text-color-secondary)]">
          <p>
            最近拖的边：
            <span className="font-mono text-[var(--text-color-primary)]">
              {lastEdge || '还没有'}
            </span>
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--text-color-placeholder)]">
            {Math.round(bounds.width)}×{Math.round(bounds.height)}
            {gestureActive ? ' · 缩放中' : ''}
          </p>
        </div>
        <CwFloatingWindowResizeHandles
          visible={mode === 'normal' && visible}
          onResizePointerdown={(edge, event) => {
            setLastEdge(edge)
            onResizePointerDown(edge, event)
          }}
        />
      </CwFloatingWindowShell>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <ResizeHandlesDemo visible={args.visible} />,
}
