import { FINE_POINTER_HOVER_MEDIA } from '@zengchaowu/ui-shared/components/CwPopup/utils/finePointerHoverMedia'

export interface FinePointerHoverMediaWatch {
  attach: () => void
  detach: () => void
}

export function createFinePointerHoverMediaWatch(options: {
  enabled: () => boolean
  onChange: () => void
}): FinePointerHoverMediaWatch {
  let mqRef: MediaQueryList | null = null
  let attached = false

  const attach = () => {
    if (!options.enabled() || attached || typeof window === 'undefined') return
    mqRef = window.matchMedia(FINE_POINTER_HOVER_MEDIA)
    mqRef.addEventListener('change', options.onChange)
    attached = true
  }

  const detach = () => {
    if (!attached || !mqRef) return
    mqRef.removeEventListener('change', options.onChange)
    mqRef = null
    attached = false
  }

  return { attach, detach }
}
