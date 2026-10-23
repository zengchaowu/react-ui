/** 会话列表等 v-html 摘要：img 使用 data-cw-src，进入视口后再赋 src */
export const CW_DEFERRED_EMOJI_IMG_SELECTOR = 'img.cw-chat-conv-list-emoji[data-cw-src]'

export const CW_CONVERSATION_LIST_EMOJI_ROOT_MARGIN = '0px'

export interface BindDeferredEmojiImagesOptions {
  rootMargin?: string
  root?: Element | Document | null
}

function loadDeferredEmojiImage(img: HTMLImageElement) {
  const src = img.getAttribute('data-cw-src')?.trim()
  if (!src || img.getAttribute('src')?.trim()) return
  img.setAttribute('src', src)
  img.removeAttribute('data-cw-src')
}

function loadAllDeferredEmojiImages(root: Element) {
  root.querySelectorAll<HTMLImageElement>(CW_DEFERRED_EMOJI_IMG_SELECTOR).forEach(loadDeferredEmojiImage)
}

/**
 * 为容器内带 data-cw-src 的摘要 emoji 图绑定 IntersectionObserver，视口内再加载 PNG。
 * 返回 teardown；v-html 更新后请先 teardown 再重新 bind。
 */
export function bindDeferredEmojiImages(
  root: Element | null | undefined,
  options: BindDeferredEmojiImagesOptions = {},
): () => void {
  if (!root) return () => {}

  if (typeof IntersectionObserver === 'undefined') {
    loadAllDeferredEmojiImages(root)
    return () => {}
  }

  const container = root
  const rootMargin = options.rootMargin ?? CW_CONVERSATION_LIST_EMOJI_ROOT_MARGIN
  const observerRoot = options.root ?? null
  const pending = new Set<HTMLImageElement>()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const img = entry.target as HTMLImageElement
        loadDeferredEmojiImage(img)
        observer.unobserve(img)
        pending.delete(img)
      }
    },
    { root: observerRoot, rootMargin, threshold: 0 },
  )

  function scan() {
    container.querySelectorAll<HTMLImageElement>(CW_DEFERRED_EMOJI_IMG_SELECTOR).forEach((img) => {
      if (!img.getAttribute('data-cw-src')?.trim()) return
      if (pending.has(img)) return
      pending.add(img)
      observer.observe(img)
    })
  }

  scan()

  return () => {
    observer.disconnect()
    pending.clear()
  }
}
