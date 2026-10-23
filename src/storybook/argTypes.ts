/**
 * Storybook ArgTypes helpers.
 *
 * Vue prop `number | string`（比例/px 等）会被 SB 画成「Set string / Set number」联合控件。
 * Default 演示应：
 * 1) 用 `NumberOnlyProps` 把 Story args 收窄为 number
 * 2) 用 `numberControlArgType` 强制 number 控件
 * 需要 CSS 字符串（如 `300px`）的 story 另建 StoryArgs + `textControlArgType`。
 */

export type NumberControlOpts = {
  min?: number
  max?: number
  step?: number
  description?: string
}

/** 把 props 里指定字段收窄为 number，避免 SB 联合类型控件 */
export type NumberOnlyProps<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: number
}

/** 强制 Controls 为数字输入 */
export function numberControlArgType(opts: NumberControlOpts = {}) {
  const { description, min, max, step } = opts
  return {
    control: {
      type: 'number' as const,
      ...(min != null ? { min } : {}),
      ...(max != null ? { max } : {}),
      ...(step != null ? { step } : {}),
    },
    type: { name: 'number' as const },
    ...(description ? { description } : {}),
  }
}

export function textControlArgType(description?: string) {
  return {
    control: { type: 'text' as const },
    type: { name: 'string' as const },
    ...(description ? { description } : {}),
  }
}
