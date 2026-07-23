import type { CwWindowTitleBarAppearance } from './types'
import { chromeOuterEdgeBottomHairline } from '../CwTabbar/styles'

const titleBarDragRegionBase =
  'flex-1 flex items-center h-full touch-none [-webkit-app-region:drag] [app-region:drag]'

export const titleBarBase = {
  root: [
    'cw-window-title-bar relative flex items-center select-none h-[2.125rem] bg-[var(--bg-color-container)]',
    chromeOuterEdgeBottomHairline,
  ].join(' '),
  dragRegion: `${titleBarDragRegionBase} cursor-grab active:cursor-grabbing`,
  dragRegionMaximized: `${titleBarDragRegionBase} cursor-default`,
  title:
    'pointer-events-none absolute left-1/2 top-1/2 z-[var(--z-index-above)] max-w-[calc(100%-10rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center text-sm font-medium text-[var(--text-color-primary)] select-none',
  controls:
    'relative z-[var(--z-index-above-high)] flex items-center h-full [-webkit-app-region:no-drag] [app-region:no-drag]',
  macControls: 'pl-3',
  macDot:
    'flex items-center justify-center w-3 h-3 rounded-full shadow-[inset_0_0_0_1px_var(--mac-traffic-inset-ring)] transition-opacity duration-150 cursor-pointer outline-none focus:outline-none [-webkit-app-region:no-drag] [app-region:no-drag]',
  macDotIdle: 'bg-[var(--mac-traffic-idle)]',
  macDotClose: 'bg-[var(--mac-traffic-close)]',
  macDotMinimize: 'bg-[var(--mac-traffic-minimize)]',
  macDotMaximize: 'bg-[var(--mac-traffic-maximize)]',
  macDotCloseIcon: 'text-[var(--mac-traffic-icon-close)]',
  macDotMinimizeIcon: 'text-[var(--mac-traffic-icon-minimize)]',
  macDotMaximizeIcon: 'text-[var(--mac-traffic-icon-maximize)]',
  winButton:
    'flex items-center justify-center w-[2.625rem] h-full text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] transition-colors duration-100 outline-none focus:outline-none [-webkit-app-region:no-drag] [app-region:no-drag]',
  winButtonHover: 'hover:bg-[var(--bg-color-secondarycomponent-hover)]',
  winButtonCloseHover: 'hover:bg-[var(--error-color-6)] hover:text-[var(--text-color-anti)]',
  winButtonIcon: 'w-[1.125rem] h-[1.125rem] stroke-current stroke-[1.5] fill-none',
} as const

/** @deprecated */
export const defaultStyles = titleBarBase

export const appearanceRootClass: Record<CwWindowTitleBarAppearance, string> = {
  default: '',
  launcher: [
    'w-full shrink-0',
    'h-[var(--launcher-window-titlebar-height)] min-h-[var(--launcher-window-titlebar-height)]',
    'max-h-[var(--launcher-window-titlebar-height)] flex-[0_0_var(--launcher-window-titlebar-height)]',
  ].join(' '),
  folder: [
    'w-full min-w-0 flex-1',
    'h-[var(--launcher-window-titlebar-height)] min-h-[var(--launcher-window-titlebar-height)]',
    'max-h-[var(--launcher-window-titlebar-height)]',
  ].join(' '),
}
