import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import CwButton from '../CwButton/CwButton'
import CwIcon from '../CwIcon/CwIcon'
import CwDiv from '../CwDiv/CwDiv'
import {
  CW_OVERLAY_CONTENT_BODY_NO_PADDING_CLASS,
  CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS,
  CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS,
} from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import type {
  CwDynamicDialogInnerHandle,
  CwDynamicDialogInnerProps,
} from './types'
import { dialogBase } from '@zengchaowu/ui-shared/components/CwDynamicDialog/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDynamicDialog/texts'
import {
  isEventTargetInsideNodes,
  scheduleOverlayEnterVisible,
} from '../../constants/cwOverlayStack'
import {
  acquireOverlayBodyScrollLock,
  releaseOverlayBodyScrollLock,
} from '@zengchaowu/ui-shared/constants/overlayBodyScrollLock'
import { useCwDialogVariant } from './composables/useCwDialogVariant'
import { useCwOverlayLayer } from './composables/useCwOverlayLayer'
import { useDraggableDialog } from './composables/useDraggableDialog'
import { focusOverlayFirstField } from './utils/focusOverlayFirstField'

/** 与 --size-overlay-icon（18px）一致 */
const CW_OVERLAY_ICON_CLOSE_SIZE = 1.125

/** Dialog / Sheet / 预览关闭图标：class（配合 CwIcon size） */
const CW_OVERLAY_ICON_CLOSE_ICON_CLASS =
  'inline-flex items-center justify-center text-current'

/** Dialog / Sheet 顶栏关闭钮布局 class（配合 appearance=overlay-icon） */
function overlayDialogCloseButtonClass(rootClass: string): string {
  return rootClass
}

/** 全屏图库 / 附件预览独立关闭钮 */
function overlayPreviewCloseButtonClass(): string {
  return CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS
}

const OVERLAY_LEAVE_MS = 300

const CwDynamicDialogInner = forwardRef<
  CwDynamicDialogInnerHandle,
  CwDynamicDialogInnerProps
>(function CwDynamicDialogInner(
  { id, component, config, visible, texts: textsProp, onClose, children, className },
  ref,
) {
  const styles = dialogBase
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [pressPointerDownTarget, setPressPointerDownTarget] =
    useState<EventTarget | null>(null)

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const idRef = useRef(id)
  idRef.current = id
  const visibleRef = useRef(visible)
  visibleRef.current = visible
  const closeEmittedRef = useRef(false)
  const cancelEnterVisibleRef = useRef<(() => void) | null>(null)
  const hideTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(ref, () => ({ overlayRootRef }), [])

  const {
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
  } = useCwDialogVariant({ config, styles, isVisible })

  const dialogRole = isToastVariant
    ? 'alert'
    : isHudVariant
      ? 'status'
      : 'dialog'

  const dialogAriaModal =
    isModalVariant || isFullscreenVariant ? 'true' : undefined

  const dialogAriaLive = isToastVariant
    ? 'assertive'
    : isHudVariant
      ? 'polite'
      : undefined

  const dialogAriaBusy = isHudVariant ? 'true' : undefined

  const hasHeader = !!config.header && isModalVariant

  const bodyVerticalPaddingClass = hasHeader ? 'pt-2 pb-4' : 'py-4'

  const bodyPaddingEnabled = config.bodyPadding !== false

  const bodyExtraClass = config.body?.class?.trim() ?? ''

  const bodyClassList = bodyPaddingEnabled
    ? [styles.body, bodyVerticalPaddingClass, bodyExtraClass]
        .filter(Boolean)
        .join(' ')
    : [CW_OVERLAY_CONTENT_BODY_NO_PADDING_CLASS, bodyExtraClass]
        .filter(Boolean)
        .join(' ')

  const bodyNoScrollClassList = isToastVariant
    ? 'box-border flex w-full min-w-0 max-w-full flex-col overflow-visible bg-transparent p-0'
    : isFullscreenVariant
      ? [
          `${CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS} h-full min-h-0`,
          bodyExtraClass,
        ]
          .filter(Boolean)
          .join(' ')
      : !bodyPaddingEnabled
        ? [
            isModalVariant
              ? `${CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS} flex-1 min-h-0 w-full`
              : CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS,
            bodyExtraClass,
          ]
            .filter(Boolean)
            .join(' ')
        : [
            'box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4',
            bodyVerticalPaddingClass,
            bodyExtraClass,
          ]
            .filter(Boolean)
            .join(' ')

  const closeButtonTexts = { label: texts.closeText }

  const closeButtonClass = overlayDialogCloseButtonClass(styles.closeButton)

  const closeButtonStandaloneClass = isFullscreenVariant
    ? overlayPreviewCloseButtonClass()
    : overlayDialogCloseButtonClass(styles.closeButtonStandalone)

  const leaveDurationMs = config.leaveDurationMs ?? OVERLAY_LEAVE_MS

  const overlayTransitionStyle = {
    transitionDuration: `${leaveDurationMs}ms`,
  }

  const dialogDragHandleRef = config.dragHandleRef ?? (config.header ? headerRef : dialogRef)

  const { style: draggableStyle } = useDraggableDialog({
    enabled: !!config.draggable && isModalVariant,
    targetRef: dialogRef,
    handleRef: dialogDragHandleRef,
    ignoreInteractiveInHandle: true,
  })

  useEffect(() => {
    return () => {
      cancelEnterVisibleRef.current?.()
      cancelEnterVisibleRef.current = null
      if (hideTimerIdRef.current != null) {
        clearTimeout(hideTimerIdRef.current)
        hideTimerIdRef.current = null
      }
      // hide() 会在 leave 定时器与移除实例之间竞态：卸载时若尚未 close，补发一次
      if (!closeEmittedRef.current) {
        closeEmittedRef.current = true
        onCloseRef.current?.(idRef.current)
      }
    }
  }, [])

  useEffect(() => {
    cancelEnterVisibleRef.current?.()
    cancelEnterVisibleRef.current = null
    if (hideTimerIdRef.current != null) {
      clearTimeout(hideTimerIdRef.current)
      hideTimerIdRef.current = null
    }

    if (visible) {
      closeEmittedRef.current = false
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
      if (!closeEmittedRef.current) {
        closeEmittedRef.current = true
        onCloseRef.current?.(idRef.current)
      }
    }, leaveDurationMs)
  }, [visible, leaveDurationMs])

  useEffect(() => {
    if (!isVisible || !config.autofocus) return
    const frame = requestAnimationFrame(() => {
      focusOverlayFirstField(dialogRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [isVisible, config.autofocus])

  useEffect(() => {
    if (!(isVisible && showBackdrop)) return
    acquireOverlayBodyScrollLock()
    return () => releaseOverlayBodyScrollLock()
  }, [isVisible, showBackdrop])

  function handleClose(): void {
    if (closeEmittedRef.current) return
    closeEmittedRef.current = true
    onCloseRef.current?.(idRef.current)
  }

  function handlePressCapture(e: ReactPointerEvent<HTMLDivElement>): void {
    if (!dismissStackEnabled) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    setPressPointerDownTarget(e.target)
  }

  useCwOverlayLayer({
    layerId: id,
    enabled: visible && dismissStackEnabled,
    rootEl: () => overlayRootRef.current,
    panelEl: () =>
      isFullscreenVariant ? overlayRootRef.current : dialogRef.current,
    active: visible && isVisible && dismissStackEnabled,
    dismissOnClickOutside: () => config.closeOnClickOutside !== false,
    onDismiss: () => {
      const down = pressPointerDownTarget
      setPressPointerDownTarget(null)
      const panel = isFullscreenVariant
        ? overlayRootRef.current
        : dialogRef.current
      if (isEventTargetInsideNodes(down, panel)) {
        return
      }
      handleClose()
    },
  })

  if (!isRendered) return null

  return (
    <div
      ref={overlayRootRef}
      className={[
        overlayClassList,
        isVisible ? styles.overlayVisible : styles.overlayHidden,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={dialogRole}
      aria-modal={dialogAriaModal}
      aria-live={dialogAriaLive}
      aria-busy={dialogAriaBusy}
      style={overlayTransitionStyle}
      onPointerDownCapture={handlePressCapture}
    >
      {showBackdrop ? (
        <div
          className={[
            styles.backdrop,
            'z-[var(--z-index-base)]',
            backdropClass,
            isVisible ? styles.backdropVisible : backdropHiddenClass,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
          style={overlayTransitionStyle}
        />
      ) : null}

      <div
        ref={dialogRef}
        className={contentClassList}
        style={config.draggable ? draggableStyle : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {config.header && isModalVariant ? (
          <div
            ref={headerRef}
            className={[styles.header, config.draggable ? styles.headerDraggable : '']
              .filter(Boolean)
              .join(' ')}
          >
            {config.header}
            {showCloseButton ? (
              <CwButton
                shape="circle"
                variant="text"
                appearance="overlay-icon"
                className={closeButtonClass}
                texts={closeButtonTexts}
                onClick={handleClose}
              >
                <CwIcon
                  name="common--status--close-line"
                  size={CW_OVERLAY_ICON_CLOSE_SIZE}
                  className={CW_OVERLAY_ICON_CLOSE_ICON_CLASS}
                />
              </CwButton>
            ) : null}
          </div>
        ) : null}

        {bodyScrollDisabled ? (
          <div className={bodyNoScrollClassList}>
            {children !== undefined ? children : component}
          </div>
        ) : (
          <CwDiv className={bodyClassList}>
            {children !== undefined ? children : component}
          </CwDiv>
        )}

        {/* 独立关闭钮放在内容之后，避免被 gallery 层盖住 */}
        {showStandaloneCloseButton ? (
          <CwButton
            shape="circle"
            variant="text"
            appearance="overlay-icon"
            className={closeButtonStandaloneClass}
            texts={closeButtonTexts}
            onClick={handleClose}
          >
            <CwIcon
              name="common--status--close-line"
              size={CW_OVERLAY_ICON_CLOSE_SIZE}
              className={CW_OVERLAY_ICON_CLOSE_ICON_CLASS}
            />
          </CwButton>
        ) : null}
      </div>
    </div>
  )
})

export default CwDynamicDialogInner
