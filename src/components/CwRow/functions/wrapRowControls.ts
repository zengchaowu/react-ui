import type { CSSProperties } from 'react'
import type { CwColProps } from '@zengchaowu/ui-shared/components/CwRow/types'
import { buildWrapRowControlsColProps as buildWrapRowControlsColPropsBase } from '@zengchaowu/ui-shared/components/CwRow/functions/wrapRowControls'

/**
 * CwWrapRow `#controls` 贴行末的特殊布局适配（React 适配：class → className）。
 *
 * 等分空列占位依赖 JS 列数与 CSS `@container` 一致；不同步时 controls 会停在行中。
 * 内联 `marginLeft: auto` 推到行尾。插槽内须：`flex h-full w-full items-center justify-end`。
 */
export function buildWrapRowControlsColProps(
  colPros: CwColProps,
): CwColProps & { className: string; style: CSSProperties } {
  const { class: className, ...rest } = buildWrapRowControlsColPropsBase(colPros)
  return {
    ...rest,
    className,
    style: rest.style as CSSProperties,
  }
}
