import type { CwFeatureCardGridStyles } from './types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export const defaultStyles: CwFeatureCardGridStyles = {
  // 根容器：白底 + 轻微描边圆角卡片
  root: 'w-full bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-lg overflow-hidden',

  // 头部：带浅蓝渐变背景的标题条（与 CwCard header 一致需 flex，与 CwFunctionGrid 统一高度）
  header:
    'flex items-center justify-between px-3 py-2 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-color-6)_5%,transparent)_0%,transparent_100%),linear-gradient(90deg,var(--text-color-anti)_0%,var(--text-color-anti)_100%)]',
  title: '[font-size:var(--font-size-body)] font-semibold text-[var(--text-color-primary)] leading-4',

  // 布局容器（body 部分增加内边距，具体布局交给 CwGrid 控制）
  gridFixed: 'px-3 pt-2 pb-2',
  gridAuto: 'px-3 pt-2 pb-2',

  // 单个卡片：增加纵向 padding，hover 使用对比更明显的 gray-2
  item:
    'flex flex-col items-center justify-center cursor-pointer select-none rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)]',
  itemDisabled: 'opacity-50 cursor-not-allowed',

  // 图标容器（恢复为柔和灰色，可被 iconBgColor 覆盖）
  iconBox: 'flex items-center justify-center w-10 h-10 rounded-[0.75rem] bg-[var(--bg-color-secondarycontainer)]',

  // 文本
  label: 'mt-1 text-xs text-[var(--text-color-secondary)] text-center truncate w-full',
  description: 'mt-0.5 [font-size:var(--font-size-caption)] text-[var(--text-color-secondary)] text-center truncate w-full',

  // 图标样式
  iconStyles: {
    root: 'leading-none text-[var(--brand-color-6)]',
    size: 1.375
  } as CwIconEmbed
}

