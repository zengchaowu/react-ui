/** Story 演示反馈：在 setup handler 中调用，勿在 template 内直接用 alert */
export function storyAlert(message: unknown): void {
  if (typeof message === 'string') {
    window.alert(message)
    return
  }
  if (message == null) {
    window.alert('')
    return
  }
  window.alert(JSON.stringify(message, null, 2))
}
