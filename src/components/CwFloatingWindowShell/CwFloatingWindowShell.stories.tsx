import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { FloatingWindowBounds } from '@zengchaowu/shared/functions/ui/floatingWindowGeometry'
import { useCwFloatingWindowChrome } from '../../hooks/useCwFloatingWindowChrome'
import CwWindowTitleBar from '../CwWindowTitleBar/CwWindowTitleBar'
import CwFloatingWindowResizeHandles from '../CwFloatingWindowResizeHandles/CwFloatingWindowResizeHandles'
import { CwFloatingWindowShell } from './CwFloatingWindowShell'
import type { CwFloatingWindowShellComponentProps } from './CwFloatingWindowShell'

const meta: Meta<typeof CwFloatingWindowShell> = {
  title: '1. Components/Layout/CwFloatingWindowShell',
  component: CwFloatingWindowShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '绝对定位的浮窗壳。位置和尺寸由外部 bounds 写入 style；最大化铺满容器，最小化隐藏，拖拽时关掉位移动画。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maximized: { control: { type: 'boolean' }, description: '是否最大化铺满容器' },
    minimized: { control: { type: 'boolean' }, description: '是否最小化隐藏' },
    noTransition: { control: { type: 'boolean' }, description: '拖拽/缩放时关闭位移动画' },
    gestureActive: { control: { type: 'boolean' }, description: '是否处于拖动手势中' },
  },
  args: {
    maximized: false,
    minimized: false,
    noTransition: false,
    gestureActive: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

type ShellMode = 'normal' | 'minimized' | 'maximized'

function modeFromArgs(args: { maximized?: boolean; minimized?: boolean }): ShellMode {
  if (args.minimized) return 'minimized'
  if (args.maximized) return 'maximized'
  return 'normal'
}

function ShellDemo({ args }: { args: CwFloatingWindowShellComponentProps }) {
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState<ShellMode>(() => modeFromArgs(args))
  const [bounds, setBounds] = useState<FloatingWindowBounds>({
    x: 48,
    y: 56,
    width: 360,
    height: 240,
  })

  useEffect(() => {
    setMode(modeFromArgs(args))
    if (!args.minimized) setOpen(true)
  }, [args.maximized, args.minimized])

  const setModeAndArgs = (next: ShellMode) => {
    setMode(next)
    if (next !== 'minimized') setOpen(true)
  }

  const { gestureActive, onTitlePointerDown, onResizePointerDown } = useCwFloatingWindowChrome({
    bounds,
    mode,
    onBoundsChange: setBounds,
    getConstraints: () => ({
      minWidth: 240,
      minHeight: 160,
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

  const toggleMaximize = () => setModeAndArgs(mode === 'maximized' ? 'normal' : 'maximized')
  const minimize = () => setModeAndArgs('minimized')
  const restore = () => setModeAndArgs('normal')
  const close = () => {
    setOpen(false)
    setModeAndArgs('normal')
  }

  return (
    <div
      ref={setStageEl}
      className="relative h-[36rem] w-full overflow-hidden bg-[var(--bg-color-page)]"
    >
      <p className="pointer-events-none absolute left-4 top-3 z-[var(--z-index-above)] text-xs text-[var(--text-color-secondary)]">
        拖标题栏移动。黄点最小化，绿点最大化并铺满这块区域。也可用右侧 Controls 切换 maximized /
        minimized。
        {gestureActive || args.gestureActive ? '正在拖动，位移动画已关闭。' : ''}
      </p>
      {open && mode === 'minimized' ? (
        <button
          type="button"
          className="absolute bottom-4 left-4 rounded-md bg-[var(--bg-color-container)] px-3 py-1.5 text-sm text-[var(--text-color-primary)] shadow-sm"
          onClick={restore}
        >
          恢复备忘录
        </button>
      ) : null}
      {!open ? (
        <button
          type="button"
          className="absolute left-4 top-12 rounded-md bg-[var(--brand-color-6)] px-3 py-1.5 text-sm text-[var(--text-color-anti)]"
          onClick={restore}
        >
          重新打开
        </button>
      ) : null}
      {open ? (
        <CwFloatingWindowShell
          maximized={mode === 'maximized'}
          minimized={mode === 'minimized'}
          noTransition={Boolean(args.noTransition) || gestureActive}
          gestureActive={Boolean(args.gestureActive) || gestureActive}
          style={shellStyle}
        >
          <CwWindowTitleBar
            mode="mac"
            title="备忘录"
            showTitle
            appearance="fixed-height"
            background="secondarycontainer"
            maximized={mode === 'maximized'}
            onDragPointerDown={onTitlePointerDown}
            onMinimize={minimize}
            onMaximize={toggleMaximize}
            onDoubleClick={toggleMaximize}
            onClose={close}
          />
          <div className="min-h-0 flex-1 p-4 text-sm leading-relaxed text-[var(--text-color-secondary)]">
            <p>
              {mode === 'maximized'
                ? '已最大化，圆角和阴影去掉，铺满容器。'
                : '普通窗口。拖标题栏换位置，拖边缘改大小。'}
            </p>
            <p className="mt-2 font-mono text-xs text-[var(--text-color-placeholder)]">
              {Math.round(bounds.x)}, {Math.round(bounds.y)} · {Math.round(bounds.width)}×
              {Math.round(bounds.height)}
            </p>
          </div>
          <CwFloatingWindowResizeHandles
            visible={mode === 'normal'}
            onResizePointerdown={onResizePointerDown}
          />
        </CwFloatingWindowShell>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  render: (args) => <ShellDemo args={args} />,
}

export const Maximized: Story = {
  args: {
    maximized: true,
    minimized: false,
  },
  render: (args) => <ShellDemo args={args} />,
}
