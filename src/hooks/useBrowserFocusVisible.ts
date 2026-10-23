import { useEffect, useState } from 'react'

let isKeyboardUser = false
let mouseDownTime = 0
let listenerCount = 0

const handleDocumentKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    isKeyboardUser = true
  }
}

const handleDocumentMouseDown = () => {
  mouseDownTime = Date.now()
  isKeyboardUser = false
}

const handleDocumentTouchStart = () => {
  isKeyboardUser = false
}

/** 判断当前聚焦是否应该显示 focus 样式（与 shared `shouldShowFocus` 行为一致） */
export function shouldShowFocus(): boolean {
  if (Date.now() - mouseDownTime < 100) return false
  return isKeyboardUser
}

export function useBrowserFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    if (listenerCount === 0) {
      document.addEventListener('keydown', handleDocumentKeyDown, true)
      document.addEventListener('mousedown', handleDocumentMouseDown, true)
      document.addEventListener('touchstart', handleDocumentTouchStart, true)
    }
    listenerCount++

    return () => {
      listenerCount--
      if (listenerCount === 0) {
        document.removeEventListener('keydown', handleDocumentKeyDown, true)
        document.removeEventListener('mousedown', handleDocumentMouseDown, true)
        document.removeEventListener('touchstart', handleDocumentTouchStart, true)
      }
    }
  }, [])

  const handleFocus = () => {
    setIsFocusVisible(shouldShowFocus())
  }

  const handleBlur = () => {
    setIsFocusVisible(false)
  }

  return { isFocusVisible, handleFocus, handleBlur }
}
