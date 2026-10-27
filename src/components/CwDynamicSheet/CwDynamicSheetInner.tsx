import { useEffect, useRef, useState } from 'react'
import CwButton from '../CwButton/CwButton'
import CwIcon from '../CwIcon/CwIcon'
import {
  APP_OVERLAY_SAFE_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_LEFT_CLASS,
  APP_OVERLAY_SAFE_RIGHT_CLASS,
  APP_OVERLAY_SAFE_TOP_CLASS,
} from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import {
  CW_OVERLAY_CONTENT_BODY_NO_PADDING_CLASS,
  CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS,
  CW_OVERLAY_FULLSCREEN_SHEET_CONTENT_BOTTOM_CLASS,
  CW_OVERLAY_RIGHT_PANEL_SHEET_CONTENT_RIGHT_CLASS,
} from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import type { CwDynamicSheetInnerProps } from './types'
import { sheetBase } from '@zengchaowu/ui-shared/components/CwDynamicSheet/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/texts'
import { mergeOverlayTailwindClass } from '@zengchaowu/ui-shared/functions/ui/mergeOverlayTailwindClass'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleOverlayEnterVisible } from '../../constants/cwOverlayStack'
import {
  acquireOverlayBodyScrollLock,
  releaseOverlayBodyScrollLock,
} from '@zengchaowu/ui-shared/constants/overlayBodyScrollLock'
import { useCwOverlayLayer } from '../CwDynamicDialog/composables/useCwOverlayLayer'
import { focusOverlayFirstField } from '../CwDynamicDialog/utils/focusOverlayFirstField'
import { useCwDynamicSheetDrag } from './useCwDynamicSheetDrag'

/** 与 --size-overlay-icon（18px）一致 */
const CW_OVERLAY_ICON_CLOSE_SIZE = 1.125

/** Dialog / Sheet / 预览关闭图标：class（配合 CwIcon size） */
const CW_OVERLAY_ICON_CLOSE_ICON_CLASS =
  'inline-flex items-center justify-center text-current'

/** Dialog / Sheet 顶栏关闭钮布局 class（配合 appearance=overlay-icon） */
function overlayDialogCloseButtonClass(rootClass: string): string {
  return rootClass
}

function escapeTailwindClass(className: string): string {
  return className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripSafeClass(baseClass: string, safeClass: string): string {
  if (!safeClass) return baseClass
  return baseClass.replace(
    new RegExp(`\\s*${escapeTailwindClass(safeClass)}`, 'g'),
    '',
  )
}

export function CwDynamicSheetInner({
  id,
  component,
  config,
  visible,
  texts: textsProp,
  onClose,
  className,
}: CwDynamicSheetInnerProps) {
  const styles = sheetBase
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const idRef = useRef(id)
  idRef.current = id
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  const cancelEnterVisibleRef = useRef<(() => void) | null>(null)
  const hideTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const dragHandleRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)

  const backdropToneClass = config.background?.class ?? styles.backdropDefault
  const closeButtonClass = overlayDialogCloseButtonClass(styles.closeButton)

  const hasHeader = !!config.header
  const hasFooter = !!config.footer
  const bodyPaddingEnabled = config.bodyPadding !== false
  const bodyExtraClass = config.body?.class?.trim() ?? ''

  const bodyClassList = (() => {
    if (!bodyPaddingEnabled) {
      if (config.bodyScroll === false) {
        return [CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS, bodyExtraClass]
          .filter(Boolean)
          .join(' ')
      }
      return [CW_OVERLAY_CONTENT_BODY_NO_PADDING_CLASS, bodyExtraClass]
        .filter(Boolean)
        .join(' ')
    }
    let base: string
    if (hasHeader) {
      base = hasFooter
        ? `${styles.bodyWithHeader} ${styles.bodyAboveFooter}`
        : styles.bodyWithHeader
    } else if (hasFooter) {
      base = 'flex-1 min-h-0 min-w-0 overflow-y-auto px-4 pt-4 pb-2'
    } else {
      base = styles.bodyWithoutHeader
    }
    return [base, bodyExtraClass].filter(Boolean).join(' ')
  })()

  // 获取弹出方向，默认为 bottom
  const direction = config.direction || 'bottom'

  const dragToCloseEnabled = (() => {
    if (config.dragToClose === false) return false
    if (config.dragToClose === true) return true
    return direction === 'bottom'
  })()

  const showDragHandle = config.showDragHandle === true && dragToCloseEnabled

  const overlayDirectionClass = (() => {
    switch (direction) {
      case 'top':
        return styles.overlayTop
      case 'left':
        return styles.overlayLeft
      case 'right':
        return styles.overlayRight
      case 'bottom':
      default:
        return styles.overlayBottom
    }
  })()

  // 计算 safe area inset 是否启用
  const safeAreaInsetEnabled = (() => {
    const inset = config.safeAreaInset
    if (inset === false) {
      return { top: false, bottom: false, left: false, right: false }
    }
    if (typeof inset === 'object') {
      return {
        top: inset.top !== false,
        bottom: inset.bottom !== false,
        left: inset.left !== false,
        right: inset.right !== false,
      }
    }
    return { top: true, bottom: true, left: true, right: true }
  })()

  const footerClass = (() => {
    let baseClass = styles.footer
    if (!safeAreaInsetEnabled.bottom) {
      baseClass = baseClass.replace(
        new RegExp(`\\s*${escapeTailwindClass(APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS)}`, 'g'),
        ' pb-4',
      )
    }
    const extra = config.footerBar?.class?.trim()
    return [baseClass, extra].filter(Boolean).join(' ')
  })()

  const contentDirectionClass = (() => {
    const shell = config.contentShell ?? 'default'
    const contentExtra = config.content?.class?.trim() ?? ''
    let baseClass = ''

    if (shell === 'fullscreenBottom' && direction === 'bottom') {
      baseClass = CW_OVERLAY_FULLSCREEN_SHEET_CONTENT_BOTTOM_CLASS
      if (!safeAreaInsetEnabled.bottom) {
        baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_BOTTOM_CLASS)
      }
    } else if (shell === 'rightPanel' && direction === 'right') {
      baseClass = CW_OVERLAY_RIGHT_PANEL_SHEET_CONTENT_RIGHT_CLASS
      if (!safeAreaInsetEnabled.right) {
        baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_RIGHT_CLASS)
      }
    } else {
      switch (direction) {
        case 'top':
          baseClass = styles.contentTop
          if (!safeAreaInsetEnabled.top) {
            baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_TOP_CLASS)
          }
          break
        case 'left':
          baseClass = styles.contentLeft
          if (!safeAreaInsetEnabled.left) {
            baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_LEFT_CLASS)
          }
          break
        case 'right':
          baseClass = styles.contentRight
          if (!safeAreaInsetEnabled.right) {
            baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_RIGHT_CLASS)
          }
          break
        case 'bottom':
        default:
          baseClass = styles.contentBottom
          if (!safeAreaInsetEnabled.bottom) {
            baseClass = stripSafeClass(baseClass, APP_OVERLAY_SAFE_BOTTOM_CLASS)
          }
          break
      }
    }

    return mergeOverlayTailwindClass(baseClass, contentExtra)
  })()

  // 计算 transform 动画类
  const transformClass = (() => {
    if (!isVisible) {
      switch (direction) {
        case 'top':
          return '-translate-y-full'
        case 'left':
          return '-translate-x-full'
        case 'right':
          return 'translate-x-full'
        case 'bottom':
        default:
          return 'translate-y-full'
      }
    }
    return 'translate-x-0 translate-y-0'
  })()

  function handleClose(): void {
    onCloseRef.current?.(idRef.current)
  }

  const { sheetTransformStyle, backdropDragStyle } = useCwDynamicSheetDrag({
    sheetRef,
    bodyRef,
    dragHandleRef,
    headerRef,
    direction,
    enabled: dragToCloseEnabled,
    isVisible,
    onClose: handleClose,
  })

  // 监听 visible 变化，实现平滑的过渡
  useEffect(() => {
    cancelEnterVisibleRef.current?.()
    cancelEnterVisibleRef.current = null
    if (hideTimerIdRef.current != null) {
      clearTimeout(hideTimerIdRef.current)
      hideTimerIdRef.current = null
    }

    if (visible) {
      setIsRendered(true)
      cancelEnterVisibleRef.current = scheduleOverlayEnterVisible(() => {
        cancelEnterVisibleRef.current = null
        if (visibleRef.current) {
          setIsVisible(true)
        }
      })
      return
    }

    setIsVisible(false)
    hideTimerIdRef.current = setTimeout(() => {
      hideTimerIdRef.current = null
      if (visibleRef.current) return
      setIsRendered(false)
    }, CW_OVERLAY_LEAVE_MS)
  }, [visible])

  useEffect(() => {
    return () => {
      cancelEnterVisibleRef.current?.()
      cancelEnterVisibleRef.current = null
      if (hideTimerIdRef.current != null) {
        clearTimeout(hideTimerIdRef.current)
        hideTimerIdRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !config.autofocus) return
    const frame = requestAnimationFrame(() => {
      focusOverlayFirstField(sheetRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [isVisible, config.autofocus])

  useEffect(() => {
    if (!isVisible) return
    acquireOverlayBodyScrollLock()
    return () => releaseOverlayBodyScrollLock()
  }, [isVisible])

  useCwOverlayLayer({
    layerId: id,
    enabled: visible && isRendered,
    rootEl: () => overlayRootRef.current,
    panelEl: () => sheetRef.current,
    active: visible && isVisible,
    dismissOnClickOutside: () => config.closeOnClickOutside !== false,
    dismissOnEscape: () => config.closeOnEsc !== false,
    onDismiss: handleClose,
  })

  if (!isRendered) return null

  return (
    <div
      ref={overlayRootRef}
      className={[
        styles.overlay,
        overlayDirectionClass,
        isVisible ? 'opacity-100' : 'opacity-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 背景遮罩 */}
      <div
        className={[
          styles.backdrop,
          backdropToneClass,
          isVisible ? 'opacity-100' : 'opacity-0',
        ]
          .filter(Boolean)
          .join(' ')}
        style={backdropDragStyle}
      />

      {/* Sheet 内容 */}
      <div
        ref={sheetRef}
        className={[
          styles.content,
          contentDirectionClass,
          transformClass,
          dragToCloseEnabled ? 'touch-pan-y' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={sheetTransformStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {showDragHandle ? (
          <div ref={dragHandleRef} className={styles.dragHandleContainer}>
            <div className={styles.dragHandle} aria-hidden="true" />
          </div>
        ) : null}

        {/* 头部 */}
        {config.header ? (
          <div
            ref={headerRef}
            className={[styles.header, dragToCloseEnabled ? 'touch-none' : '']
              .filter(Boolean)
              .join(' ')}
          >
            {config.header}
            <CwButton
              shape="circle"
              variant="text"
              appearance="overlay-icon"
              className={closeButtonClass}
              texts={{ label: texts.closeText }}
              onClick={handleClose}
            >
              <CwIcon
                name="common--status--close-line"
                size={CW_OVERLAY_ICON_CLOSE_SIZE}
                className={CW_OVERLAY_ICON_CLOSE_ICON_CLASS}
              />
            </CwButton>
          </div>
        ) : null}

        {/* 内容区域 */}
        <div ref={bodyRef} className={bodyClassList}>
          {component}
        </div>

        {/* 底部 */}
        {config.footer ? <div className={footerClass}>{config.footer}</div> : null}
      </div>
    </div>
  )
}

export default CwDynamicSheetInner
