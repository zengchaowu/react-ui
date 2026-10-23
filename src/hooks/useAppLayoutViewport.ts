import { useEffect, useMemo, useState } from 'react'
import {
  readIsBelowMdViewport,
  readIsMobileTouchInteraction,
  subscribeLayoutViewportSignals,
} from '@zengchaowu/shared/functions/browser/readLayoutViewportSignals'

export function useAppLayoutViewport() {
  const [isBelowMd, setIsBelowMd] = useState(() => readIsBelowMdViewport())
  const [isMobileTouchInteraction, setIsMobileTouchInteraction] = useState(() =>
    readIsMobileTouchInteraction(),
  )

  useEffect(() => {
    const unsub = subscribeLayoutViewportSignals({
      onBelowMdChange: (matches) => {
        setIsBelowMd(matches)
      },
      onMobileTouchInteractionChange: () => {
        setIsMobileTouchInteraction(readIsMobileTouchInteraction())
      },
    })
    return unsub
  }, [])

  const showDesktopKeyboardShortcuts = useMemo(
    () => !isMobileTouchInteraction,
    [isMobileTouchInteraction],
  )

  return {
    isBelowMd,
    isMobileTouchInteraction,
    showDesktopKeyboardShortcuts,
  }
}
