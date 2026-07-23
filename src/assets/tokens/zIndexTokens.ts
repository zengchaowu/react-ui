/**
 * 与 tokens.css 中 `--z-index-*` 数值一致（文档 / 非样式逻辑只读对照）。
 * 组件样式禁止内联 number：一律 `z-[var(--z-index-*)]`；动态叠放优先 DOM 顺序。
 */
export const Z_INDEX_TOKEN = {
  base: 0,
  above: 1,
  aboveHigh: 2,
  sticky: 10,
  float: 20,
  fixedColumnHeader: 30,
  fixedColumnShadow: 40,
  sceneOverlay: 50,
  modal: 100,
  contextMenu: 120,
  toast: 200,
} as const

export type ZIndexTokenKey = keyof typeof Z_INDEX_TOKEN
