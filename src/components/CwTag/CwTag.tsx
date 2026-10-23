import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { CwTagProps } from './types'
import { tagBase } from './styles'
import { defaultTexts } from './texts'
import CwIcon from '../CwIcon/CwIcon'

let isKeyboardUser = false
let mouseDownTime = 0
let focusVisibleListenerCount = 0

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

function useBrowserFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    if (focusVisibleListenerCount === 0) {
      document.addEventListener('keydown', handleDocumentKeyDown, true)
      document.addEventListener('mousedown', handleDocumentMouseDown, true)
      document.addEventListener('touchstart', handleDocumentTouchStart, true)
    }
    focusVisibleListenerCount++

    return () => {
      focusVisibleListenerCount--
      if (focusVisibleListenerCount === 0) {
        document.removeEventListener('keydown', handleDocumentKeyDown, true)
        document.removeEventListener('mousedown', handleDocumentMouseDown, true)
        document.removeEventListener('touchstart', handleDocumentTouchStart, true)
      }
    }
  }, [])

  const handleFocus = () => {
    setIsFocusVisible(Date.now() - mouseDownTime >= 100 ? isKeyboardUser : false)
  }

  const handleBlur = () => {
    setIsFocusVisible(false)
  }

  return { isFocusVisible, handleFocus, handleBlur }
}

export function CwTag({
  content,
  closable = false,
  disabled = false,
  readonly = false,
  type = 'default',
  size = 'medium',
  texts,
  children,
  className,
  onClick,
  onClose,
  ...rest
}: CwTagProps) {
  const styles = tagBase
  const resolvedTexts = useMemo(() => ({ ...defaultTexts, ...(texts ?? {}) }), [texts])
  const tabIndex = disabled ? undefined : 0

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()

  const typeClass = useMemo(() => {
    const typeMap = {
      default: styles.typeDefault,
      primary: styles.typePrimary,
      success: styles.typeSuccess,
      warning: styles.typeWarning,
      danger: styles.typeDanger,
    }
    return typeMap[type || 'default']
  }, [styles, type])

  const sizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    }
    return sizeMap[size || 'medium']
  }, [styles, size])

  const contentSizeClass = useMemo(() => {
    const sizeMap = {
      small: styles.contentSizeSmall,
      medium: styles.contentSizeMedium,
      large: styles.contentSizeLarge,
    }
    return sizeMap[size || 'medium'] ?? ''
  }, [styles, size])

  const closeIconSize = useMemo(() => {
    const map = { small: 0.75, medium: 0.875, large: 1 } as const
    return map[size || 'medium']
  }, [size])

  const closeIconStyles = useMemo(() => {
    const iconStyle = styles.closeIconStyles || {}
    return {
      size: iconStyle.size ?? closeIconSize,
      className: [
        iconStyle.class || '',
        disabled
          ? 'text-[var(--text-color-disabled)]'
          : readonly
            ? 'text-[var(--text-color-secondary)]'
            : 'text-[var(--text-color-secondary)]',
      ]
        .filter(Boolean)
        .join(' '),
    }
  }, [styles, disabled, readonly, closeIconSize])

  const rootClassList = [
    styles.root,
    disabled ? styles.rootDisabled : readonly ? styles.rootReadonly : styles.rootNormal,
    typeClass,
    sizeClass,
    isFocusVisible && !disabled ? styles.rootFocused : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const contentClassList = [
    styles.content,
    contentSizeClass,
    disabled ? styles.contentDisabled : readonly ? styles.contentReadonly : styles.contentNormal,
  ]
    .filter(Boolean)
    .join(' ')

  const closeButtonClassList = [
    styles.closeButton,
    disabled
      ? styles.closeButtonDisabled
      : readonly
        ? styles.closeButtonReadonly
        : styles.closeButtonNormal,
    !disabled && !readonly ? styles.closeButtonHover : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleFocus = () => {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  const handleBlur = () => {
    handleFocusVisibleBlur()
  }

  const handleClose = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation()
    if (disabled || readonly) {
      event.preventDefault()
      return
    }
    onClose?.(event as unknown as MouseEvent)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled || readonly) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(event.nativeEvent as unknown as MouseEvent)
    }

    if (closable && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault()
      handleClose(event.nativeEvent)
    }
  }

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled || readonly) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onClick?.(event.nativeEvent)
  }

  const handleCloseClick = (event: ReactMouseEvent<HTMLSpanElement>) => {
    event.stopPropagation()
    handleClose(event.nativeEvent)
  }

  return (
    <div
      {...rest}
      className={rootClassList}
      role="button"
      tabIndex={tabIndex}
      aria-disabled={disabled ? 'true' : 'false'}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <span className={contentClassList}>{children != null ? children : content}</span>
      {closable ? (
        <span
          className={closeButtonClassList}
          role="button"
          aria-label={resolvedTexts.closeLabel}
          aria-disabled={disabled || readonly ? 'true' : 'false'}
          onClick={handleCloseClick}
        >
          <CwIcon
            name="common--status--close-line"
            prefix="icon"
            size={closeIconStyles.size}
            className={closeIconStyles.className}
          />
        </span>
      ) : null}
    </div>
  )
}

export default CwTag
