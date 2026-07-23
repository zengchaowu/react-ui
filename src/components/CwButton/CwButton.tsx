import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import type {
  CwButtonAppearance,
  CwButtonProps as CwButtonBaseProps,
  CwButtonType,
  CwButtonVariant,
} from './types'
import {
  appearanceContentClass,
  appearanceRootClass,
  appearanceSelectedRootClass,
  appearanceSkipsShape,
  appearanceSkipsSize,
  appearanceSkipsVariantColor,
  appearanceUnselectedRootClass,
  buttonBase,
} from './styles'
import { defaultTexts } from './texts'

export type CwButtonProps = CwButtonBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'children'> & {
    children?: ReactNode
    className?: string
    onClick?: (event: MouseEvent | KeyboardEvent) => void
    /** React 侧 tooltip 插槽 */
    tooltipSlot?: ReactNode
  }

const KEYBOARD_ACTIVATION_KEYS = new Set(['Enter', ' ', 'Spacebar'])
const KEYBOARD_ACTIVATION_CODES = new Set(['Enter', 'NumpadEnter', 'Space'])

const isKeyboardActivation = (event: KeyboardEvent) =>
  KEYBOARD_ACTIVATION_KEYS.has(event.key) || KEYBOARD_ACTIVATION_CODES.has(event.code)

const variantClassMap = {
  solid: {
    default:
      'bg-[var(--button-neutral-solid-bg)] text-[var(--text-color-primary)] hover:bg-[var(--button-neutral-solid-bg-hover)] active:bg-[var(--button-neutral-solid-bg-active)] data-[keyboard-active=true]:bg-[var(--button-neutral-solid-bg-active)]',
    primary:
      'bg-[var(--brand-color-6)] text-[var(--button-primary-onbrand-fg)] hover:bg-[var(--brand-color-hover)] active:bg-[var(--brand-color-active)] data-[keyboard-active=true]:bg-[var(--brand-color-active)]',
    danger:
      'bg-[var(--error-color-6)] text-[var(--button-primary-onbrand-fg)] hover:bg-[var(--error-color-hover)] active:bg-[var(--error-color-active)] data-[keyboard-active=true]:bg-[var(--error-color-active)]',
  },
  outline: {
    default:
      'bg-transparent text-[var(--text-color-primary)] border border-[var(--button-outline-default-border)] hover:bg-[var(--button-neutral-overlay-hover-bg)] active:bg-[var(--button-neutral-overlay-active-bg)] data-[keyboard-active=true]:bg-[var(--button-neutral-overlay-active-bg)]',
    primary:
      'bg-transparent text-[var(--brand-color-6)] border border-[var(--brand-color-special)] hover:text-[var(--brand-color-hover)] hover:border-[var(--brand-color-hover)] hover:bg-[var(--button-brand-tint-hover-bg)] active:text-[var(--brand-color-active)] active:border-[var(--brand-color-active)] active:bg-[var(--button-brand-tint-active-bg)] data-[keyboard-active=true]:text-[var(--brand-color-active)] data-[keyboard-active=true]:border-[var(--brand-color-active)] data-[keyboard-active=true]:bg-[var(--button-brand-tint-active-bg)]',
    danger:
      'bg-transparent text-[var(--error-color-6)] border border-[var(--error-color-special)] hover:text-[var(--error-color-hover)] hover:border-[var(--error-color-hover)] hover:bg-[var(--button-danger-tint-hover-bg)] active:text-[var(--error-color-active)] active:border-[var(--error-color-active)] active:bg-[var(--button-danger-tint-active-bg)] data-[keyboard-active=true]:text-[var(--error-color-active)] data-[keyboard-active=true]:border-[var(--error-color-active)] data-[keyboard-active=true]:bg-[var(--button-danger-tint-active-bg)]',
  },
  text: {
    default:
      'bg-transparent text-[var(--text-color-primary)] hover:bg-[var(--button-neutral-overlay-hover-bg)] active:bg-[var(--button-neutral-overlay-active-bg)] data-[keyboard-active=true]:bg-[var(--button-neutral-overlay-active-bg)]',
    primary:
      'bg-transparent text-[var(--brand-color-6)] hover:text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-hover-bg)] active:text-[var(--brand-color-6)] active:bg-[var(--button-brand-tint-active-bg)] data-[keyboard-active=true]:text-[var(--brand-color-6)] data-[keyboard-active=true]:bg-[var(--button-brand-tint-active-bg)]',
    danger:
      'bg-transparent text-[var(--error-color-6)] hover:text-[var(--error-color-6)] hover:bg-[var(--button-danger-tint-hover-bg)] active:text-[var(--error-color-6)] active:bg-[var(--button-danger-tint-active-bg)] data-[keyboard-active=true]:text-[var(--error-color-6)] data-[keyboard-active=true]:bg-[var(--button-danger-tint-active-bg)]',
  },
  dashed: {
    default:
      'bg-transparent text-[var(--text-color-primary)] border border-dashed border-[var(--button-dashed-default-border)] hover:bg-[var(--button-neutral-overlay-hover-bg)] active:bg-[var(--button-neutral-overlay-active-bg)] data-[keyboard-active=true]:bg-[var(--button-neutral-overlay-active-bg)]',
    primary:
      'bg-transparent text-[var(--brand-color-6)] border border-dashed border-[var(--brand-color-special)] hover:text-[var(--brand-color-hover)] hover:border-[var(--brand-color-hover)] hover:bg-[var(--button-brand-tint-hover-bg)] active:text-[var(--brand-color-active)] active:border-[var(--brand-color-active)] active:bg-[var(--button-brand-tint-active-bg)] data-[keyboard-active=true]:text-[var(--brand-color-active)] data-[keyboard-active=true]:border-[var(--brand-color-active)] data-[keyboard-active=true]:bg-[var(--button-brand-tint-active-bg)]',
    danger:
      'bg-transparent text-[var(--error-color-6)] border border-dashed border-[var(--error-color-special)] hover:text-[var(--error-color-hover)] hover:border-[var(--error-color-hover)] hover:bg-[var(--button-danger-tint-hover-bg)] active:text-[var(--error-color-active)] active:border-[var(--error-color-active)] active:bg-[var(--button-danger-tint-active-bg)] data-[keyboard-active=true]:text-[var(--error-color-active)] data-[keyboard-active=true]:border-[var(--error-color-active)] data-[keyboard-active=true]:bg-[var(--button-danger-tint-active-bg)]',
  },
  ghost: {
    default:
      'bg-transparent text-[var(--button-ghost-on-dark-fg)] border border-[var(--button-ghost-on-dark-border)] hover:text-[var(--brand-color-hover)] hover:border-[var(--brand-color-hover)] active:text-[var(--brand-color-active)] active:border-[var(--brand-color-active)] data-[keyboard-active=true]:text-[var(--brand-color-active)] data-[keyboard-active=true]:border-[var(--brand-color-active)]',
    primary:
      'bg-transparent text-[var(--brand-color-6)] border border-[var(--brand-color-6)] hover:text-[var(--brand-color-hover)] hover:border-[var(--brand-color-hover)] active:text-[var(--brand-color-active)] active:border-[var(--brand-color-active)] data-[keyboard-active=true]:text-[var(--brand-color-active)] data-[keyboard-active=true]:border-[var(--brand-color-active)]',
    danger:
      'bg-transparent text-[var(--error-color-6)] border border-[var(--error-color-6)] hover:text-[var(--error-color-hover)] hover:border-[var(--error-color-hover)] active:text-[var(--error-color-active)] active:border-[var(--error-color-active)] data-[keyboard-active=true]:text-[var(--error-color-active)] data-[keyboard-active=true]:border-[var(--error-color-active)]',
  },
  overlay: {
    default:
      'bg-[var(--button-overlay-bg)] text-[var(--button-overlay-fg)] border border-[var(--button-overlay-border)] hover:bg-[var(--button-overlay-bg-hover)] active:bg-[var(--button-overlay-bg-active)] data-[keyboard-active=true]:bg-[var(--button-overlay-bg-active)]',
    primary:
      'bg-[var(--button-overlay-bg)] text-[var(--brand-color-6)] border border-[var(--brand-color-special)] hover:bg-[var(--button-brand-tint-hover-bg)] active:bg-[var(--button-brand-tint-active-bg)] data-[keyboard-active=true]:bg-[var(--button-brand-tint-active-bg)]',
    danger:
      'bg-[var(--button-overlay-bg)] text-[var(--error-color-6)] border border-[var(--error-color-special)] hover:bg-[var(--button-danger-tint-hover-bg)] active:bg-[var(--button-danger-tint-active-bg)] data-[keyboard-active=true]:bg-[var(--button-danger-tint-active-bg)]',
  },
} satisfies Record<CwButtonVariant, Record<CwButtonType, string>>

const disabledVariantClassMap = {
  solid: {
    default: 'bg-[var(--button-disabled-neutral-bg)] text-[var(--button-disabled-neutral-fg)]',
    primary: 'bg-[var(--brand-color-disabled)] text-[var(--button-primary-onbrand-fg)]',
    danger: 'bg-[var(--error-color-disabled)] text-[var(--button-primary-onbrand-fg)]',
  },
  outline: {
    default:
      'bg-transparent text-[var(--button-disabled-neutral-fg)] border border-[var(--button-disabled-neutral-border)]',
    primary:
      'bg-transparent text-[var(--button-disabled-brand-fg)] border border-[var(--button-disabled-brand-border)]',
    danger:
      'bg-transparent text-[var(--button-disabled-danger-fg)] border border-[var(--button-disabled-danger-border)]',
  },
  text: {
    default: 'bg-transparent text-[var(--button-disabled-neutral-fg)]',
    primary: 'bg-transparent text-[var(--button-disabled-brand-fg)]',
    danger: 'bg-transparent text-[var(--button-disabled-danger-fg)]',
  },
  dashed: {
    default:
      'bg-transparent text-[var(--button-disabled-neutral-fg)] border border-dashed border-[var(--button-disabled-neutral-border)]',
    primary:
      'bg-transparent text-[var(--button-disabled-brand-fg)] border border-dashed border-[var(--button-disabled-brand-border)]',
    danger:
      'bg-transparent text-[var(--button-disabled-danger-fg)] border border-dashed border-[var(--button-disabled-danger-border)]',
  },
  ghost: {
    default:
      'bg-transparent text-[var(--button-ghost-on-dark-fg-disabled)] border border-[var(--button-ghost-on-dark-border-disabled)]',
    primary:
      'bg-transparent text-[var(--button-ghost-on-dark-fg-disabled)] border border-[var(--button-ghost-on-dark-border-disabled)]',
    danger:
      'bg-transparent text-[var(--button-ghost-on-dark-fg-disabled)] border border-[var(--button-ghost-on-dark-border-disabled)]',
  },
  overlay: {
    default:
      'bg-[var(--button-overlay-bg-disabled)] text-[var(--button-overlay-fg-disabled)] border border-[var(--button-overlay-border-disabled)]',
    primary:
      'bg-[var(--button-overlay-bg-disabled)] text-[var(--button-disabled-brand-fg)] border border-[var(--button-disabled-brand-border)]',
    danger:
      'bg-[var(--button-overlay-bg-disabled)] text-[var(--button-disabled-danger-fg)] border border-[var(--button-disabled-danger-border)]',
  },
} satisfies Record<CwButtonVariant, Record<CwButtonType, string>>

function resolveVariantClass(
  map: Record<CwButtonVariant, Record<CwButtonType, string>>,
  variant: CwButtonVariant,
  type: CwButtonType,
) {
  const variantStyles = map[variant] ?? map.solid
  return variantStyles?.[type] ?? variantStyles?.default ?? ''
}

function hasTextContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false
  if (typeof node === 'string') return node.trim().length > 0
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some(hasTextContent)
  return true
}

export const CwButton = forwardRef<HTMLDivElement, CwButtonProps>(function CwButton(
  props,
  ref,
) {
  const {
    type = 'default',
    size = 'medium',
    shape = 'rounded',
    disabled = false,
    loading = false,
    appearance: appearanceProp = 'default',
    selected = false,
    texts: textsProp,
    variant = 'solid',
    tooltip,
    tooltipSlot,
    children,
    className,
    onClick,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    ...rest
  } = props

  const texts = useMemo(() => ({ ...defaultTexts, ...(textsProp ?? {}) }), [textsProp])
  const appearance = (appearanceProp || 'default') as CwButtonAppearance
  const [keyboardActive, setKeyboardActive] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)

  const hasSlotContent = hasTextContent(children)
  const isIconButton =
    appearance === 'icon' ||
    appearance === 'avatar' ||
    appearance === 'overlay-icon' ||
    (appearance !== 'backdrop' &&
      appearance !== 'desktop-icon' &&
      appearance !== 'tile' &&
      !hasSlotContent)

  const buttonTypeStyles = appearanceSkipsVariantColor.has(appearance)
    ? ''
    : resolveVariantClass(variantClassMap, variant, type)

  const buttonDisabledStyles = (() => {
    if (appearanceSkipsVariantColor.has(appearance)) {
      if (appearance === 'on-media-text') {
        return '!bg-transparent !text-white/40 !opacity-100'
      }
      return 'opacity-40'
    }
    return resolveVariantClass(disabledVariantClassMap, variant, type)
  })()

  const buttonSizeStyles = (() => {
    if (appearanceSkipsSize.has(appearance)) return ''
    if (isIconButton) {
      switch (size) {
        case 'compact':
          return 'h-8 w-8 min-w-8'
        case 'small':
          return 'h-7 w-7'
        case 'large':
          return 'h-11 w-11'
        default:
          return 'h-9 w-9'
      }
    }
    switch (size) {
      case 'compact':
        return 'px-2 py-0.5 text-sm font-medium tabular-nums'
      case 'small':
        return 'px-3 py-1 text-xs'
      case 'large':
        return 'px-6 py-2.5 text-base'
      default:
        return 'px-4 py-1.5 text-sm'
    }
  })()

  const buttonShapeStyles = (() => {
    if (appearanceSkipsShape.has(appearance)) return ''
    if (isIconButton) {
      switch (shape) {
        case 'square':
          return 'rounded-none'
        case 'circle':
          return 'rounded-full'
        default:
          return 'rounded-[var(--radius-default)]'
      }
    }
    switch (shape) {
      case 'square':
        return 'rounded-none'
      case 'circle':
        return 'rounded-full'
      default:
        return 'rounded-[var(--radius-default)]'
    }
  })()

  const appearanceExtraRoot = (() => {
    const base = appearanceRootClass[appearance] || ''
    if (appearance === 'list-item' || appearance === 'preset') {
      if (selected) {
        return [base, appearanceSelectedRootClass[appearance] || ''].filter(Boolean).join(' ')
      }
      return [base, appearanceUnselectedRootClass[appearance] || ''].filter(Boolean).join(' ')
    }
    return base
  })()

  const rootFocusClass = focusVisible && !disabled ? buttonBase.rootFocused : ''

  const rootClassList = [
    buttonBase.root,
    disabled ? buttonBase.rootDisabled : buttonBase.rootNormal,
    disabled ? buttonDisabledStyles : buttonTypeStyles,
    buttonSizeStyles,
    buttonShapeStyles,
    appearanceExtraRoot,
    rootFocusClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const contentClassList = [buttonBase.content, appearanceContentClass[appearance] || '']
    .filter(Boolean)
    .join(' ')

  const loadingSpinnerSize = (() => {
    switch (size) {
      case 'small':
        return '!w-3 !h-3'
      case 'large':
        return '!w-5 !h-5'
      default:
        return '!w-3.5 !h-3.5'
    }
  })()

  const spinnerClass = [
    buttonBase.loadingStyles.spinnerCircle,
    'border-t-[currentColor] border-r-[currentColor] border-2',
    !isIconButton ? loadingSpinnerSize : '!w-full !h-full border-2',
  ]
    .filter(Boolean)
    .join(' ')

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (disabled || loading) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      setKeyboardActive(false)
      onClick?.(event)
    },
    [disabled, loading, onClick],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (disabled || loading) return
      if (!isKeyboardActivation(event)) return
      event.preventDefault()
      setKeyboardActive(true)
      onClick?.(event)
    },
    [disabled, loading, onClick, onKeyDown],
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyUp?.(event)
      if (!keyboardActive) return
      if (!isKeyboardActivation(event)) return
      setKeyboardActive(false)
    },
    [keyboardActive, onKeyUp],
  )

  const ariaLabel = hasSlotContent ? undefined : texts.label || undefined
  const selectedAriaPressed =
    appearance === 'list-item' || appearance === 'preset'
      ? selected
        ? 'true'
        : 'false'
      : undefined

  const titleAttr =
    !disabled && tooltip && !tooltipSlot ? tooltip : undefined

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-label={ariaLabel}
      aria-pressed={selectedAriaPressed}
      title={titleAttr}
      className={rootClassList}
      data-keyboard-active={keyboardActive ? 'true' : undefined}
      data-appearance={appearance}
      data-selected={selected ? 'true' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={(e) => {
        if (!disabled) setFocusVisible(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocusVisible(false)
        setKeyboardActive(false)
        onBlur?.(e)
      }}
      {...rest}
    >
      <div className={contentClassList}>
        {loading ? (
          <span
            className={[!isIconButton ? buttonBase.loadingSpinner : '', 'inline-flex']
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            <span className={spinnerClass} />
          </span>
        ) : null}
        {!(loading && isIconButton) ? children : null}
      </div>
    </div>
  )
})

export default CwButton
