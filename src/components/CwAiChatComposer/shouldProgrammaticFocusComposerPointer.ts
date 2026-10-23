/**
 * 窄屏空态折叠时，空段落是 flex + in-flow placeholder。
 * 手指点在编辑区上会走系统选区（Android 空选区手柄），
 * 与程序化 `focus('end')` 不一致。
 * 折叠态一律拦截原生聚焦；已展开时仅拦截点在编辑区外壳（非内容区）的点击。
 */
export function shouldProgrammaticFocusComposerPointer(input: {
  isNarrowCollapsed: boolean
  isOnProseMirror: boolean
}): boolean {
  if (input.isNarrowCollapsed) return true
  return !input.isOnProseMirror
}
