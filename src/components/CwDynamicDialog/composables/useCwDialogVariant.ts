import { useMemo } from 'react'
import type {
  CwDynamicDialogConfig,
  CwDynamicDialogStyles,
  CwDynamicDialogVariant,
} from '../types'
import { mergeDialogModalContentClass } from '../styles'

export interface UseCwDialogVariantOptions {
  config: CwDynamicDialogConfig
  styles: CwDynamicDialogStyles
  isVisible: boolean
}

export function useCwDialogVariant(options: UseCwDialogVariantOptions) {
  const { config, styles, isVisible } = options
  const variant: CwDynamicDialogVariant = config.variant ?? 'modal'

  return useMemo(() => {
    const isModalVariant = variant === 'modal'
    const isFullscreenVariant = variant === 'fullscreen'
    const isToastVariant = variant === 'toast'
    const isHudVariant = variant === 'hud'

    const dismissStackEnabled =
      config.dismissStack !== undefined
        ? config.dismissStack
        : isHudVariant && config.hudMaskClosable
          ? true
          : isModalVariant || isFullscreenVariant

    const showBackdrop = isToastVariant
      ? false
      : isHudVariant
        ? config.hudMask !== false
        : true

    const backdropClass =
      isHudVariant && config.hudMask !== false
        ? 'bg-[var(--overlay-scrim-panel)]'
        : config.background?.class || styles.backdropDefault

    const backdropHiddenClass = showBackdrop
      ? styles.backdropHidden
      : styles.backdropHiddenVariant

    let overlayClassList: string
    switch (variant) {
      case 'fullscreen':
        overlayClassList = styles.overlayFullscreen
        break
      case 'toast': {
        const pos = config.toastPosition ?? 'top'
        const posClass =
          pos === 'middle'
            ? styles.overlayToastMiddle
            : pos === 'bottom'
              ? styles.overlayToastBottom
              : styles.overlayToastTop
        overlayClassList = [styles.overlayToast, posClass].join(' ')
        break
      }
      case 'hud':
        overlayClassList = [
          styles.overlayHud,
          config.hudMask === false ? 'bg-transparent' : '',
          'pointer-events-none',
        ]
          .filter(Boolean)
          .join(' ')
        break
      default: {
        const align =
          config.modalAlign === 'upper'
            ? styles.overlayAlignUpper
            : styles.overlayAlignCenter
        overlayClassList = [styles.overlay, align].filter(Boolean).join(' ')
        break
      }
    }

    const contentVisibleClass =
      isToastVariant || isHudVariant || isFullscreenVariant
        ? isVisible
          ? 'opacity-100'
          : 'opacity-0'
        : isModalVariant && config.contentTransition === 'fade'
          ? isVisible
            ? 'opacity-100'
            : 'opacity-0'
          : isVisible
            ? styles.contentVisible
            : styles.contentHidden

    const draggable = config.draggable ? styles.contentDraggable : ''
    const extra = config.content?.class

    let contentClassList: string
    if (isFullscreenVariant) {
      contentClassList = [
        mergeDialogModalContentClass(styles.contentFullscreen, extra),
        contentVisibleClass,
        draggable,
      ]
        .filter(Boolean)
        .join(' ')
    } else if (isToastVariant) {
      contentClassList = [
        mergeDialogModalContentClass(styles.contentToast, extra),
        contentVisibleClass,
      ]
        .filter(Boolean)
        .join(' ')
    } else if (isHudVariant) {
      const base =
        config.hudMask === false ? styles.contentHudNoMask : styles.contentHud
      contentClassList = [
        mergeDialogModalContentClass(base, extra),
        contentVisibleClass,
      ]
        .filter(Boolean)
        .join(' ')
    } else {
      contentClassList = [
        mergeDialogModalContentClass(styles.content, extra),
        'relative z-[var(--z-index-above)]',
        contentVisibleClass,
        draggable,
      ]
        .filter(Boolean)
        .join(' ')
    }

    const showCloseButton =
      isToastVariant || isHudVariant
        ? false
        : config.showCloseButton !== undefined
          ? config.showCloseButton
          : !!config.header

    const showStandaloneCloseButton =
      showCloseButton && (isModalVariant || isFullscreenVariant) && !config.header

    const bodyScrollDisabled =
      config.bodyScroll === false ||
      isFullscreenVariant ||
      isToastVariant ||
      isHudVariant

    return {
      variant,
      isModalVariant,
      isFullscreenVariant,
      isToastVariant,
      isHudVariant,
      dismissStackEnabled,
      showBackdrop,
      backdropClass,
      backdropHiddenClass,
      overlayClassList,
      contentClassList,
      showCloseButton,
      showStandaloneCloseButton,
      bodyScrollDisabled,
    }
  }, [config, styles, isVisible, variant])
}
