import { Fragment, isValidElement, useMemo, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from 'react'
import type {
  CwButtonAppearance,
  CwButtonProps,
  CwButtonType,
  CwButtonVariant,
} from './types'
import {
  appearanceContentClass,
  appearanceFocusRootClass,
  appearanceRootClass,
  appearanceSelectedRootClass,
  appearanceSkipsShape,
  appearanceSkipsSize,
  appearanceSkipsVariantColor,
  appearanceUnselectedRootClass,
  buttonBase,
} from './styles'
import { defaultTexts } from './texts'
import CwLoading from '../CwLoading/CwLoading'
import CwTooltip from '../CwTooltip/CwTooltip'

import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

type NodeWithChildren = ReactElement<{
  children?: ReactNode
  dangerouslySetInnerHTML?: { __html?: string }
}>

const flattenNodes = (nodes: ReactNode[]): ReactNode[] => {
  const result: ReactNode[] = []
  nodes.forEach((node) => {
    if (node == null || typeof node === 'boolean') return
    if (Array.isArray(node)) {
      result.push(...flattenNodes(node))
      return
    }
    if (typeof node === 'string') {
      if (node.trim().length > 0) {
        result.push(node)
      }
      return
    }
    if (typeof node === 'number') {
      result.push(node)
      return
    }
    if (!isValidElement(node)) {
      result.push(node)
      return
    }
    if (node.type === Fragment) {
      const children = (node as NodeWithChildren).props.children
      if (Array.isArray(children)) {
        result.push(...flattenNodes(children))
      } else if (typeof children === 'string' && children.trim().length > 0) {
        result.push(children)
      }
      return
    }
    result.push(node)
  })
  return result
}

const nodeHasTextContent = (node: ReactNode): boolean => {
  if (typeof node === 'string') return node.trim().length > 0
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some((child) => nodeHasTextContent(child))
  if (!isValidElement(node)) return false
  const props = (node as NodeWithChildren).props
  if (props.dangerouslySetInnerHTML?.__html) {
    return props.dangerouslySetInnerHTML.__html.trim().length > 0
  }
  return nodeHasTextContent(props.children)
}

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
      'bg-transparent text-[var(--text-color-primary)] border border-[var(--border-color)] hover:bg-[var(--button-neutral-overlay-hover-bg)] active:bg-[var(--button-neutral-overlay-active-bg)] data-[keyboard-active=true]:bg-[var(--button-neutral-overlay-active-bg)]',
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
      'bg-transparent text-[var(--text-color-primary)] border border-dashed border-[var(--border-color)] hover:bg-[var(--button-neutral-overlay-hover-bg)] active:bg-[var(--button-neutral-overlay-active-bg)] data-[keyboard-active=true]:bg-[var(--button-neutral-overlay-active-bg)]',
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

const resolveVariantClass = (
  map: Record<CwButtonVariant, Record<CwButtonType, string>>,
  variant: CwButtonVariant,
  type: CwButtonType,
) => {
  const variantStyles = map[variant] ?? map.solid
  return variantStyles?.[type] ?? variantStyles?.default ?? ''
}

const KEYBOARD_ACTIVATION_KEYS = new Set(['Enter', ' ', 'Spacebar'])
const KEYBOARD_ACTIVATION_CODES = new Set(['Enter', 'NumpadEnter', 'Space'])

const isKeyboardActivation = (event: KeyboardEvent) =>
  KEYBOARD_ACTIVATION_KEYS.has(event.key) || KEYBOARD_ACTIVATION_CODES.has(event.code)

export function CwButton({
  type = 'default',
  variant = 'solid',
  appearance = 'default',
  selected = false,
  size = 'medium',
  shape = 'rounded',
  disabled = false,
  loading = false,
  texts,
  tooltip,
  tooltipProps,
  tooltipAppearance,
  tooltipClass,
  tooltipTexts,
  tooltipSlot,
  children,
  className,
  onClick,
  ...rest
}: CwButtonProps) {
  const resolvedTexts = useMemo(() => ({ ...defaultTexts, ...(texts ?? {}) }), [texts])
  const resolvedAppearance = (appearance || 'default') as CwButtonAppearance

  const contentNodes = useMemo(() => flattenNodes([children]), [children])
  const hasSlotContent = contentNodes.length > 0
  const isIconButton = useMemo(() => {
    if (
      resolvedAppearance === 'icon' ||
      resolvedAppearance === 'avatar' ||
      resolvedAppearance === 'overlay-icon'
    ) {
      return true
    }
    if (
      resolvedAppearance === 'backdrop' ||
      resolvedAppearance === 'grid-column' ||
      resolvedAppearance === 'tile'
    ) {
      return false
    }
    if (contentNodes.length !== 1) return false
    return !nodeHasTextContent(contentNodes[0])
  }, [contentNodes, resolvedAppearance])

  const { isFocusVisible, handleFocus: handleFocusVisibleFocus, handleBlur: handleFocusVisibleBlur } =
    useBrowserFocusVisible()
  const [keyboardActive, setKeyboardActive] = useState(false)

  const tooltipContent = tooltip ?? ''
  const resolvedTooltipAppearance = tooltipAppearance || 'default'
  const hasTooltipSlot = tooltipSlot != null

  const tooltipOptions = useMemo(
    () => ({
      placement: 'top' as const,
      showDelay: 120,
      hideDelay: 100,
      closeOnClickOutside: false,
      trigger: 'hover' as const,
      ...(tooltipProps ?? {}),
    }),
    [tooltipProps],
  )

  const tooltipEnabled = !disabled && (Boolean(tooltip) || hasTooltipSlot)
  const tabIndex = disabled ? undefined : 0
  const ariaLabel = hasSlotContent ? undefined : resolvedTexts.label || undefined
  const selectedAriaPressed =
    resolvedAppearance === 'list-item' || resolvedAppearance === 'preset'
      ? selected
        ? 'true'
        : 'false'
      : undefined

  const buttonTypeStyles = appearanceSkipsVariantColor.has(resolvedAppearance)
    ? ''
    : resolveVariantClass(variantClassMap, variant, type)

  let buttonDisabledStyles = ''
  if (appearanceSkipsVariantColor.has(resolvedAppearance)) {
    buttonDisabledStyles =
      resolvedAppearance === 'text-on-image'
        ? '!bg-transparent !text-white/40 !opacity-100'
        : 'opacity-40'
  } else {
    buttonDisabledStyles = resolveVariantClass(disabledVariantClassMap, variant, type)
  }

  let buttonSizeStyles = ''
  if (!appearanceSkipsSize.has(resolvedAppearance)) {
    if (isIconButton) {
      switch (size) {
        case 'compact':
          buttonSizeStyles = 'h-8 w-8 min-w-8'
          break
        case 'small':
          buttonSizeStyles = 'h-7 w-7'
          break
        case 'large':
          buttonSizeStyles = 'h-11 w-11'
          break
        default:
          buttonSizeStyles = 'h-9 w-9'
      }
    } else {
      switch (size) {
        case 'compact':
          buttonSizeStyles = 'min-h-6 px-2 py-0.5 text-xs font-medium leading-5 tabular-nums'
          break
        case 'small':
          buttonSizeStyles = 'px-3 py-1 text-xs'
          break
        case 'large':
          buttonSizeStyles = 'px-6 py-2.5 text-base'
          break
        default:
          buttonSizeStyles = 'px-4 py-1.5 text-sm'
      }
    }
  }

  let buttonShapeStyles = ''
  if (!appearanceSkipsShape.has(resolvedAppearance)) {
    switch (shape || 'rounded') {
      case 'square':
        buttonShapeStyles = 'rounded-none'
        break
      case 'circle':
        buttonShapeStyles = 'rounded-full'
        break
      default:
        buttonShapeStyles = 'rounded-[var(--radius-default)]'
    }
  }

  const loadingRootClass = !isIconButton ? buttonBase.loadingSpinner : ''
  const loadingSpinnerClass = !isIconButton
    ? size === 'small'
      ? '!w-3 !h-3'
      : size === 'large'
        ? '!w-5 !h-5'
        : '!w-3.5 !h-3.5'
    : ''

  let rootFocusClass = ''
  if (isFocusVisible && !disabled) {
    if (resolvedAppearance !== 'grid-column' && resolvedAppearance !== 'backdrop') {
      rootFocusClass = appearanceFocusRootClass[resolvedAppearance] || buttonBase.rootFocused
    }
  }

  let appearanceExtraRoot = appearanceRootClass[resolvedAppearance] || ''
  if (resolvedAppearance === 'list-item' || resolvedAppearance === 'preset') {
    appearanceExtraRoot = [
      appearanceExtraRoot,
      selected
        ? appearanceSelectedRootClass[resolvedAppearance] || ''
        : appearanceUnselectedRootClass[resolvedAppearance] || '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  const contentClassList =
    appearanceContentClass[resolvedAppearance] || buttonBase.content

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

  const handleFocus = () => {
    if (disabled) return
    handleFocusVisibleFocus()
  }

  const handleBlur = () => {
    handleFocusVisibleBlur()
    setKeyboardActive(false)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled || loading) return
    if (!isKeyboardActivation(event.nativeEvent)) return

    event.preventDefault()
    setKeyboardActive(true)
    onClick?.(event.nativeEvent)
  }

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!keyboardActive) return
    if (!isKeyboardActivation(event.nativeEvent)) return
    setKeyboardActive(false)
  }

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (disabled || loading) {
      event.preventDefault()
      return
    }
    setKeyboardActive(false)
    onClick?.(event.nativeEvent)
  }

  const loadingNode = loading ? (
    <CwLoading
      type="spinner"
      size="small"
      appearance="currentColor"
      className={loadingRootClass}
      spinnerClass={loadingSpinnerClass}
    />
  ) : null

  const trigger = (
    <div
      {...rest}
      className={rootClassList}
      role="button"
      tabIndex={tabIndex}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-label={ariaLabel}
      aria-pressed={selectedAriaPressed}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      data-keyboard-active={keyboardActive ? 'true' : undefined}
      data-appearance={resolvedAppearance}
      data-selected={selected ? 'true' : undefined}
    >
      <div className={contentClassList}>
        {!isIconButton ? (
          <>
            {loadingNode}
            {children}
            {!hasSlotContent && resolvedTexts.label ? (
              <span>{resolvedTexts.label}</span>
            ) : null}
          </>
        ) : loading ? (
          loadingNode
        ) : (
          children
        )}
      </div>
    </div>
  )

  if (tooltipEnabled) {
    return (
      <CwTooltip
        {...tooltipOptions}
        appearance={resolvedTooltipAppearance}
        className={tooltipClass}
        texts={tooltipTexts}
        triggerSlot={trigger}
      >
        {tooltipSlot ?? tooltipContent}
      </CwTooltip>
    )
  }

  return trigger
}

export default CwButton
