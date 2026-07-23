const HEIGHT_DELTA_THRESHOLD_PX = 72
const VIEWPORT_OBSCURED_THRESHOLD_PX = 48

function isEditableElement(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  if (el.closest('.ProseMirror')) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const input = el as HTMLInputElement
    if (input.type === 'hidden' || input.disabled) return false
    if (input.readOnly && !el.isContentEditable) return false
    return true
  }
  return false
}

function isEditableFocused(): boolean {
  const active = document.activeElement
  if (isEditableElement(active)) return true
  if (active instanceof HTMLElement && active.closest('.ProseMirror')) return true
  return false
}

function isComposerEditableFocused(): boolean {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return false
  return Boolean(active.closest('.cw-chat-message-composer-mobile, .cw-message-input'))
}

function isNativeWebView(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }
  return Boolean(w.Capacitor?.isNativePlatform?.())
}

function isMobileTouchViewport(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  const narrow = window.matchMedia?.('(max-width: 48rem)')?.matches
  return Boolean(coarse && narrow)
}

/** 同步 `html[data-virtual-keyboard-open]`，供 safe-area.css 清零页内底栏 inset */
export function syncVirtualKeyboardOpenState(open: boolean): void {
  const root = document.documentElement
  if (open) {
    root.dataset.virtualKeyboardOpen = 'true'
  } else {
    delete root.dataset.virtualKeyboardOpen
  }
}

/**
 * 监听 visualViewport / focus，键盘弹出时去掉页内底栏 safe-bottom，
 * 避免输入框与 IME 之间出现 home 指示条高度的留白。
 */
export function bootstrapVirtualKeyboardInsets(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  let baselineLayoutHeight = window.innerHeight
  let focusOutTimer = 0
  let raf = 0

  function scheduleUpdate() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(update)
  }

  function measureOpen(): boolean {
    if (!isEditableFocused()) return false

    // Capacitor / 手机触屏：消息输入框聚焦时 IME 会占用底部，不应再叠 home inset
    if (
      isComposerEditableFocused() &&
      (isNativeWebView() || isMobileTouchViewport())
    ) {
      return true
    }

    const vv = window.visualViewport
    if (vv) {
      const obscured = window.innerHeight - vv.height - vv.offsetTop
      if (obscured > VIEWPORT_OBSCURED_THRESHOLD_PX) return true
    }

    return window.innerHeight < baselineLayoutHeight - HEIGHT_DELTA_THRESHOLD_PX
  }

  function update() {
    syncVirtualKeyboardOpenState(measureOpen())
  }

  function onFocusIn(ev: FocusEvent) {
    window.clearTimeout(focusOutTimer)
    const target = ev.target
    if (target instanceof HTMLElement) {
      if (isEditableElement(target) || target.closest('.ProseMirror')) {
        baselineLayoutHeight = window.innerHeight
      }
    }
    scheduleUpdate()
  }

  function onFocusOut() {
    window.clearTimeout(focusOutTimer)
    focusOutTimer = window.setTimeout(() => {
      if (!isEditableFocused()) {
        syncVirtualKeyboardOpenState(false)
        baselineLayoutHeight = window.innerHeight
        return
      }
      scheduleUpdate()
    }, 250)
  }

  const vv = window.visualViewport
  vv?.addEventListener('resize', scheduleUpdate)
  vv?.addEventListener('scroll', scheduleUpdate)
  window.addEventListener('resize', scheduleUpdate)
  document.addEventListener('focusin', onFocusIn, true)
  document.addEventListener('focusout', onFocusOut, true)

  update()

  return () => {
    cancelAnimationFrame(raf)
    window.clearTimeout(focusOutTimer)
    vv?.removeEventListener('resize', scheduleUpdate)
    vv?.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    document.removeEventListener('focusin', onFocusIn, true)
    document.removeEventListener('focusout', onFocusOut, true)
    syncVirtualKeyboardOpenState(false)
  }
}
