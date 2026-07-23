/** 内部默认结构类（不可被业务 styles 覆盖） */
export const fileIconBase = {
  root: 'cw-file-icon inline-flex items-center justify-center shrink-0 select-none',
  image: 'block [image-rendering:-webkit-optimize-contrast]',
  defaultSize: 1,
} as const

/** @deprecated 兼容旧名 */
export const defaultStyles = {
  root: fileIconBase.root,
  image: fileIconBase.image,
  size: fileIconBase.defaultSize,
}
