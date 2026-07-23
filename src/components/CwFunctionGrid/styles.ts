import type { CwFunctionGridStyles } from './types'
import type { CwGridStyles } from '../CwGrid/types'
import type {  CwIconEmbed  } from '../CwIcon/types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwFunctionGridStyles = {
  // 根容器：白底卡片 + 轻描边 + 圆角，内部由 header / body 自己控制 padding
  root: 'cw-function-grid w-full bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-lg overflow-hidden',

  // 头部：与 CwFeatureCardGrid 保持一致的浅色渐变背景（统一更高一些）
  header:
    'flex items-center justify-between px-3 py-2 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-color-6)_5%,transparent)_0%,transparent_100%),linear-gradient(90deg,var(--text-color-anti)_0%,var(--text-color-anti)_100%)]',
  titleContainer: 'flex items-center gap-2',
  titleBar: 'w-1 h-3 bg-[var(--brand-color-6)] rounded-full',
  title: '[font-size:var(--font-size-body)] font-semibold text-[var(--text-color-primary)] leading-4',
  allStoresLink:
    'flex items-center gap-1 text-xs text-[var(--text-color-secondary)] cursor-pointer hover:text-[var(--brand-color-6)] transition-colors duration-200 outline-none focus:outline-none',
  allStoresLinkNormal: '',
  allStoresLinkFocused: INTERACTIVE_FOCUS_CLASS,
  gridStyles: {
    // body：在卡片内部增加统一的内边距
    root: 'px-3 pt-2 pb-2'
  } as Partial<CwGridStyles>,

  // 功能项样式（确保在 CwGrid 中正确显示）
  functionItemRoot:
    'w-full flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors duration-200 outline-none focus:outline-none',
  // hover 底色使用 gray-2，避免和图标容器 gray-1 混在一起
  functionItemRootNormal: 'cursor-pointer hover:bg-[var(--bg-color-component-hover)]',
  functionItemRootDisabled: 'cursor-not-allowed opacity-50',
  functionItemRootFocused: INTERACTIVE_FOCUS_CLASS,
  functionItemContent: 'flex flex-col items-center justify-center w-full',
  functionItemIconContainer: 'mb-1 flex items-center justify-center w-10 h-10 rounded-[0.75rem] bg-[var(--bg-color-secondarycontainer)]',
  functionItemIconContainerNormal: 'text-[var(--brand-color-6)]',
  functionItemIconContainerDisabled: 'bg-[var(--bg-color-component)] text-[var(--text-color-disabled)]',
  functionItemLabel: 'text-xs text-center truncate w-full',
  functionItemLabelNormal: 'text-[var(--text-color-primary)]',
  functionItemLabelDisabled: 'text-[var(--text-color-disabled)]',
  functionItemIconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1.5
  } as CwIconEmbed,
  arrowIconStyles: {
    root: 'inline-flex items-center justify-center text-current',
    size: 0.875
  } as CwIconEmbed
}

