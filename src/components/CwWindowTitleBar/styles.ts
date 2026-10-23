import type {
  CwWindowTitleBarAppearance,
  CwWindowTitleBarBackground,
  CwWindowTitleBarTitleSize,
} from './types'
import { chromeOuterEdgeBottomHairline } from '../CwTabbar/styles'

const titleBarDragRegionBase =
  'flex-1 flex items-center h-full touch-none [-webkit-app-region:drag] [app-region:drag]'

const titleLayout =
  'pointer-events-none absolute left-1/2 top-1/2 z-[var(--z-index-above)] max-w-[min(24rem,calc(100%-5rem))] -translate-x-1/2 -translate-y-1/2 truncate text-center font-medium text-[var(--text-color-primary)] select-none'

export const titleBarBase = {
  root: [
    'cw-window-title-bar relative flex items-center select-none h-[2.125rem]',
    chromeOuterEdgeBottomHairline,
  ].join(' '),
  dragRegion: `${titleBarDragRegionBase} cursor-grab active:cursor-grabbing`,
  dragRegionMaximized: `${titleBarDragRegionBase} cursor-default`,
  title: titleLayout,
  controls:
    'relative z-[var(--z-index-above-high)] flex items-center h-full [-webkit-app-region:no-drag] [app-region:no-drag]',
  macControls: 'pl-3',
  macDot:
    'flex items-center justify-center w-3 h-3 rounded-full ring-1 ring-inset ring-[var(--mac-traffic-inset-ring)] transition-opacity duration-150 cursor-pointer outline-none focus:outline-none [-webkit-app-region:no-drag] [app-region:no-drag]',
  macDotIdle: 'bg-[var(--mac-traffic-idle)]',
  macDotClose: 'bg-[var(--mac-traffic-close)]',
  macDotMinimize: 'bg-[var(--mac-traffic-minimize)]',
  macDotMaximize: 'bg-[var(--mac-traffic-maximize)]',
  macDotCloseIcon: 'text-[var(--mac-traffic-icon-close)]',
  macDotMinimizeIcon: 'text-[var(--mac-traffic-icon-minimize)]',
  macDotMaximizeIcon: 'text-[var(--mac-traffic-icon-maximize)]',
  winButton:
    'flex items-center justify-center w-[2.625rem] h-full cursor-default text-[var(--text-color-secondary)] transition-colors duration-100 outline-none focus:outline-none [-webkit-app-region:no-drag] [app-region:no-drag]',
  winButtonHover:
    'hover:bg-[var(--bg-color-secondarycomponent-hover)] hover:text-[var(--text-color-primary)]',
  winButtonClose:
    'hover:bg-[var(--error-color-6)] hover:text-white',
  winDragRegion: titleBarDragRegionBase,
  winButtonIcon: 'w-[1.125rem] h-[1.125rem] stroke-current stroke-[1.5] fill-none',
  /** 顶栏左侧自定义区（如浏览器标签），与右侧窗口按钮同一行 */
  startRegion:
    'relative z-[var(--z-index-above)] flex min-w-0 flex-1 items-center self-stretch overflow-hidden touch-none [-webkit-app-region:drag] [app-region:drag]',
  /** 窗口操作按钮左侧自定义区（如布局切换） */
  endRegion:
    'relative z-[var(--z-index-above-high)] flex h-full shrink-0 items-center gap-1 self-stretch px-1 [-webkit-app-region:no-drag] [app-region:no-drag]',
} as const

export const appearanceRootClass: Record<CwWindowTitleBarAppearance, string> = {
  default: '',
  'fixed-height': [
    'w-full shrink-0',
    'h-[var(--launcher-window-titlebar-height)] min-h-[var(--launcher-window-titlebar-height)]',
    'max-h-[var(--launcher-window-titlebar-height)] flex-[0_0_var(--launcher-window-titlebar-height)]',
  ].join(' '),
  'flex-fill': [
    'w-full min-w-0 flex-1',
    'h-[var(--launcher-window-titlebar-height)] min-h-[var(--launcher-window-titlebar-height)]',
    'max-h-[var(--launcher-window-titlebar-height)]',
  ].join(' '),
}

export const backgroundRootClass: Record<CwWindowTitleBarBackground, string> = {
  container: 'bg-[var(--bg-color-container)]',
  secondarycontainer: 'bg-[var(--bg-color-secondarycontainer)]',
}

export const titleSizeClass: Record<CwWindowTitleBarTitleSize, string> = {
  md: 'text-sm',
  sm: '[font-size:var(--font-size-caption)]',
}
