import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  UIEvent as ReactUIEvent,
} from 'react'
import './cw-ai-chat-composer-inline.css'
import './cw-ai-chat-composer-actions.css'
import { CwIcon } from '../CwIcon/CwIcon'
import { aiChatComposerBase } from './styles'
import { defaultCwAiChatComposerTexts } from './texts'
import type {
  CwAiChatComposerComponentProps,
  CwAiChatComposerHandle,
  CwAiChatComposerTexts,
} from './types'
import { useCwAiChatComposerEditor } from './useCwAiChatComposerEditor'
import { useCwAiChatComposerLayout } from './useCwAiChatComposerLayout'
import { useCwAiChatComposerVoiceHold } from './useCwAiChatComposerVoiceHold'
import { shouldProgrammaticFocusComposerPointer } from './shouldProgrammaticFocusComposerPointer'
import {
  COMPOSER_ACTION_CLOSE_DURATION,
  COMPOSER_ACTION_CLOSE_EASE,
  COMPOSER_ACTION_OPEN_DURATION,
  COMPOSER_ACTION_OPEN_EASE,
  COMPOSER_INLINE_TEXT_OPTICAL_NUDGE_REM,
  COMPOSER_TOOLBAR_GAP_REM,
  COMPOSER_TOOLBAR_HEIGHT_REM,
} from './constants'
import { COMPOSER_LAYOUT_TRANSITION_MS } from './layoutGeometry'

const ACTION_ICON_SIZE = 1.75

const composerCssVars = {
  '--composer-btn-size': `${COMPOSER_TOOLBAR_HEIGHT_REM}rem`,
  '--composer-toolbar-gap': `${COMPOSER_TOOLBAR_GAP_REM}rem`,
  '--composer-action-close-duration': COMPOSER_ACTION_CLOSE_DURATION,
  '--composer-action-close-ease': COMPOSER_ACTION_CLOSE_EASE,
  '--composer-action-open-duration': COMPOSER_ACTION_OPEN_DURATION,
  '--composer-action-open-ease': COMPOSER_ACTION_OPEN_EASE,
  '--composer-inline-text-nudge': `${COMPOSER_INLINE_TEXT_OPTICAL_NUDGE_REM}rem`,
} as CSSProperties

function roleKeyHandler(callback: () => void) {
  return (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }
}

export const CwAiChatComposer = forwardRef<
  CwAiChatComposerHandle,
  CwAiChatComposerComponentProps
>(function CwAiChatComposer(
  {
    value,
    disabled = false,
    sending = false,
    showAttach = true,
    showVoice = true,
    voiceIcon = 'chat--call--voice-line',
    minRows = 1,
    maxRows = 8,
    pendingAttachmentCount = 0,
    layout = 'wide',
    texts: textsProp,
    onChange,
    onSubmit,
    onStop,
    onAttachClick,
    onVoiceModeChange,
    onVoiceRecordStart,
    onVoiceRecordEnd,
    className,
    ...rest
  },
  ref,
) {
  const texts = useMemo<CwAiChatComposerTexts>(
    () => ({
      ...defaultCwAiChatComposerTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const editorShellRef = useRef<HTMLDivElement | null>(null)
  const composerShellRef = useRef<HTMLDivElement | null>(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  /** 进入语音模式前的壳层高度。底边钉住后，变矮只向上收，底栏按钮不会上移。 */
  const [voiceModeAnchorPx, setVoiceModeAnchorPx] = useState<number | null>(null)
  const voiceModeAnchorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const voiceToggleLockedUntilRef = useRef(0)

  const showStop = sending && !disabled
  const canSend =
    !disabled &&
    !sending &&
    (value.trim().length > 0 || pendingAttachmentCount > 0)
  /** AI 响应中隐藏附件，避免仅置灰占位 */
  const showAttachResolved = Boolean(showAttach) && !sending

  const {
    editorRef,
    focusEditor,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFocus,
    handleBlur,
  } = useCwAiChatComposerEditor({
    value,
    placeholder: texts.placeholder,
    disabled,
    showStop,
    canSend,
    onUpdateModelValue: (next) => onChange?.(next),
    onSubmit: () => onSubmit?.(),
    isEditorFocused,
    setIsEditorFocused,
  })

  const {
    isWideLayout,
    isNarrowCollapsed,
    attachInStart,
    editorFieldClass,
    shellClass,
    showPrimaryAction,
    shellLayoutStyle,
    editorLayoutStyle,
    voiceLayoutStyle,
    attachLayoutStyle,
    actionsLayoutStyle,
  } = useCwAiChatComposerLayout({
    layout,
    value,
    minRows,
    maxRows,
    showAttach: showAttachResolved,
    showVoice,
    isEditorFocused,
    isVoiceMode,
    editorShellRef,
    canSend,
    showStop,
    pendingAttachmentCount,
  })

  const voiceInputDisabled = disabled || sending || !isVoiceMode

  const {
    isRecording: isVoiceRecording,
    isCancelPending: isVoiceCancelPending,
    onPointerDown: onVoiceHoldPointerDown,
    onPointerMove: onVoiceHoldPointerMove,
    onPointerUp: onVoiceHoldPointerUp,
    onPointerCancel: onVoiceHoldPointerCancel,
    cancelActiveHold,
  } = useCwAiChatComposerVoiceHold({
    disabled: voiceInputDisabled,
    onStart: () => onVoiceRecordStart?.(),
    onEnd: (payload) => onVoiceRecordEnd?.(payload),
  })

  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const voiceModeRef = useRef(isVoiceMode)
  voiceModeRef.current = isVoiceMode
  const narrowCollapsedRef = useRef(isNarrowCollapsed)
  narrowCollapsedRef.current = isNarrowCollapsed
  const focusEditorRef = useRef(focusEditor)
  focusEditorRef.current = focusEditor

  const captureVoiceModeAnchor = useCallback(() => {
    setVoiceModeAnchorPx((previous) => {
      if (previous != null) return previous
      const height = composerShellRef.current?.offsetHeight ?? 0
      return height > 0 ? height : null
    })
  }, [])

  const releaseVoiceModeAnchorLater = useCallback(() => {
    clearTimeout(voiceModeAnchorTimerRef.current)
    voiceModeAnchorTimerRef.current = setTimeout(() => {
      voiceModeAnchorTimerRef.current = undefined
      if (!voiceModeRef.current) setVoiceModeAnchorPx(null)
    }, COMPOSER_LAYOUT_TRANSITION_MS)
  }, [])

  const enterVoiceMode = useCallback(() => {
    if (disabledRef.current) return
    captureVoiceModeAnchor()
    clearTimeout(voiceModeAnchorTimerRef.current)
    voiceModeAnchorTimerRef.current = undefined
    voiceModeRef.current = true
    setIsVoiceMode(true)
    setIsEditorFocused(false)
    editorRef.current?.blur()
    onVoiceModeChange?.(true)
  }, [captureVoiceModeAnchor, editorRef, onVoiceModeChange])

  const exitVoiceMode = useCallback(() => {
    if (!voiceModeRef.current) return
    cancelActiveHold()
    voiceModeRef.current = false
    setIsVoiceMode(false)
    onVoiceModeChange?.(false)
    releaseVoiceModeAnchorLater()
  }, [cancelActiveHold, onVoiceModeChange, releaseVoiceModeAnchorLater])

  useEffect(() => {
    if (sending) cancelActiveHold()
  }, [sending, cancelActiveHold])

  useEffect(() => {
    if (!disabled) return
    cancelActiveHold()
    if (voiceModeRef.current) exitVoiceMode()
  }, [disabled, cancelActiveHold, exitVoiceMode])

  useEffect(() => {
    return () => clearTimeout(voiceModeAnchorTimerRef.current)
  }, [])

  const tryProgrammaticFocus = useCallback(
    (target: EventTarget | null): boolean => {
      if (disabledRef.current || voiceModeRef.current) return false
      if (!editorRef.current) return false
      const element =
        target instanceof HTMLElement
          ? target
          : target instanceof Node
            ? target.parentElement
            : null
      if (!element) return false
      if (
        element.closest(
          'button, a, [role="button"], input, textarea, select',
        )
      ) {
        return false
      }
      if (
        !shouldProgrammaticFocusComposerPointer({
          isNarrowCollapsed: narrowCollapsedRef.current,
          isOnProseMirror: Boolean(element.closest('.ProseMirror')),
        })
      ) {
        return false
      }
      setIsEditorFocused(true)
      focusEditorRef.current()
      return true
    },
    [editorRef],
  )

  const handleEditorShellPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!tryProgrammaticFocus(event.target)) return
      event.preventDefault()
      event.stopPropagation()
    },
    [tryProgrammaticFocus],
  )

  useEffect(() => {
    const element = editorShellRef.current
    if (!element) return undefined
    const handleTouchStart = (event: TouchEvent) => {
      if (!tryProgrammaticFocus(event.target)) return
      event.preventDefault()
      event.stopPropagation()
    }
    element.addEventListener('touchstart', handleTouchStart, {
      capture: true,
      passive: false,
    })
    return () => {
      element.removeEventListener('touchstart', handleTouchStart, {
        capture: true,
      })
    }
  }, [tryProgrammaticFocus])

  const handleComposerShellScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      const element = event.currentTarget
      if (element.scrollTop !== 0) element.scrollTop = 0
      if (element.scrollLeft !== 0) element.scrollLeft = 0
    },
    [],
  )

  const onCompactActionPointerDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (isNarrowCollapsed) event.preventDefault()
    },
    [isNarrowCollapsed],
  )

  const onVoiceToggleClick = useCallback(() => {
    if (disabledRef.current) return
    const now = performance.now()
    if (now < voiceToggleLockedUntilRef.current) return
    voiceToggleLockedUntilRef.current = now + 50
    if (voiceModeRef.current) exitVoiceMode()
    else enterVoiceMode()
  }, [enterVoiceMode, exitVoiceMode])

  const handleAttachClick = useCallback(() => {
    if (disabledRef.current || sending) return
    onAttachClick?.()
  }, [sending, onAttachClick])

  const handleAttachContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      handleAttachClick()
    },
    [handleAttachClick],
  )

  const handlePrimaryClick = useCallback(() => {
    if (disabledRef.current) return
    if (showStop) {
      onStop?.()
      return
    }
    if (canSend) onSubmit?.()
  }, [showStop, canSend, onStop, onSubmit])

  const focus = useCallback(() => {
    if (disabledRef.current || voiceModeRef.current) return
    setIsEditorFocused(true)
    focusEditor()
  }, [focusEditor])

  useImperativeHandle(
    ref,
    () => ({ focus, enterVoiceMode, exitVoiceMode }),
    [focus, enterVoiceMode, exitVoiceMode],
  )

  const toolbarBtnVoiceHoldClass = isVoiceRecording
    ? (aiChatComposerBase.toolbarBtnVoiceHold ?? '')
    : ''

  let voiceHoldClass = aiChatComposerBase.voiceHoldArea ?? ''
  if (voiceInputDisabled) {
    voiceHoldClass = [voiceHoldClass, aiChatComposerBase.voiceHoldAreaDisabled]
      .filter(Boolean)
      .join(' ')
  } else if (isVoiceRecording) {
    const recordingLayer = 'z-[var(--z-index-above)]'
    voiceHoldClass = [
      voiceHoldClass,
      recordingLayer,
      isVoiceCancelPending
        ? aiChatComposerBase.voiceHoldAreaCancel
        : aiChatComposerBase.voiceHoldAreaActive,
    ]
      .filter(Boolean)
      .join(' ')
  }

  const rootStyle: CSSProperties =
    voiceModeAnchorPx == null
      ? composerCssVars
      : { ...composerCssVars, minHeight: `${voiceModeAnchorPx}px` }

  const shellStyle: CSSProperties = isVoiceRecording
    ? { ...shellLayoutStyle, overflow: 'visible' }
    : shellLayoutStyle

  const editorStyle: CSSProperties = {
    ...editorLayoutStyle,
    minHeight: '0',
    overflow: 'clip',
  }

  const toolbarTabindex = (enabled: boolean): number | undefined =>
    enabled ? 0 : undefined

  const primaryTabindex =
    !disabled && showPrimaryAction && (showStop || canSend) ? 0 : undefined

  const renderAttachButton = () => (
    <div
      role="button"
      tabIndex={toolbarTabindex(!disabled)}
      className={[aiChatComposerBase.attachBtn, toolbarBtnVoiceHoldClass]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={texts.attachAriaLabel}
      onClick={handleAttachClick}
      onContextMenu={handleAttachContextMenu}
      onMouseDown={onCompactActionPointerDown}
      onKeyDown={roleKeyHandler(handleAttachClick)}
    >
      <CwIcon
        name="common--action--circle-add-line"
        prefix="icon"
        size={ACTION_ICON_SIZE}
      />
    </div>
  )

  return (
    <div
      {...rest}
      className={[
        aiChatComposerBase.root,
        isWideLayout
          ? 'cw-ai-chat-composer--wide'
          : 'cw-ai-chat-composer--narrow',
        voiceModeAnchorPx != null ? 'flex flex-col justify-end' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
    >
      <div
        ref={composerShellRef}
        className={shellClass}
        style={shellStyle}
        onScroll={handleComposerShellScroll}
      >
        {isVoiceMode ? (
          <div
            className={voiceHoldClass}
            aria-label={texts.holdToSpeakLabel}
            onPointerDown={onVoiceHoldPointerDown}
            onPointerMove={onVoiceHoldPointerMove}
            onPointerUp={onVoiceHoldPointerUp}
            onPointerCancel={onVoiceHoldPointerCancel}
            onContextMenu={(event) => event.preventDefault()}
          >
            {isVoiceRecording ? (
              <div className={aiChatComposerBase.voiceHint}>
                {texts.voiceRecordingHint}
              </div>
            ) : null}
            <span>{texts.holdToSpeakLabel}</span>
          </div>
        ) : null}

        <div
          ref={editorShellRef}
          className={[
            'cw-ai-chat-composer__editor box-border z-[var(--z-index-base)] min-w-0 overflow-hidden',
            editorFieldClass,
            isNarrowCollapsed
              ? 'cw-ai-chat-composer__editor--collapsed-inline'
              : '',
            isVoiceMode ? 'pointer-events-none opacity-0' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={editorStyle}
          role={isVoiceMode ? undefined : 'textbox'}
          aria-label={isVoiceMode ? undefined : texts.placeholder}
          aria-multiline={isVoiceMode ? undefined : 'true'}
          onPointerDownCapture={handleEditorShellPointerDown}
        >
          {!isVoiceMode ? (
            <div className="relative">
              <div
                ref={editorRef}
                className="ProseMirror"
                contentEditable={!disabled}
                suppressContentEditableWarning
                spellCheck={false}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          ) : null}
        </div>

        {showVoice ? (
          <div
            className="cw-ai-chat-composer__voice-slot z-[var(--z-index-above)] flex items-center justify-center"
            style={voiceLayoutStyle}
          >
            <div
              role="button"
              tabIndex={toolbarTabindex(!disabled)}
              className={[aiChatComposerBase.voiceBtn, toolbarBtnVoiceHoldClass]
                .filter(Boolean)
                .join(' ')}
              aria-disabled={disabled ? 'true' : undefined}
              aria-label={
                isVoiceMode ? texts.keyboardAriaLabel : texts.voiceAriaLabel
              }
              onClick={onVoiceToggleClick}
              onMouseDown={onCompactActionPointerDown}
              onKeyDown={roleKeyHandler(onVoiceToggleClick)}
            >
              <CwIcon
                name={isVoiceMode ? 'chat--msg--keyboard-line' : voiceIcon}
                prefix="icon"
                size={ACTION_ICON_SIZE}
              />
            </div>
          </div>
        ) : null}

        {attachInStart && attachLayoutStyle ? (
          <div
            className="cw-ai-chat-composer__attach-slot z-[var(--z-index-above)] flex items-center justify-center"
            style={attachLayoutStyle}
          >
            {renderAttachButton()}
          </div>
        ) : null}

        <div
          className="cw-ai-chat-composer__actions-slot z-[var(--z-index-above)] flex items-center"
          style={actionsLayoutStyle}
        >
          {showAttachResolved && !attachInStart ? renderAttachButton() : null}

          <div
            className={[
              'cw-ai-chat-composer__primary-action-slot',
              showPrimaryAction
                ? 'cw-ai-chat-composer__primary-action-slot--open'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={showPrimaryAction ? undefined : 'true'}
          >
            <div
              role="button"
              tabIndex={primaryTabindex}
              className={[
                showStop ? aiChatComposerBase.stopBtn : aiChatComposerBase.sendBtn,
                !showStop && !canSend ? aiChatComposerBase.sendBtnDisabled : '',
                toolbarBtnVoiceHoldClass,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-disabled={!showStop && !canSend ? 'true' : undefined}
              aria-label={showStop ? texts.stopAriaLabel : texts.sendAriaLabel}
              onClick={handlePrimaryClick}
              onMouseDown={onCompactActionPointerDown}
              onKeyDown={roleKeyHandler(handlePrimaryClick)}
            >
              {showStop ? (
                <CwIcon
                  name="common--status--stop-filled"
                  prefix="icon"
                  size={ACTION_ICON_SIZE}
                />
              ) : (
                <CwIcon
                  name="chat--msg--send-filled"
                  prefix="icon"
                  size={ACTION_ICON_SIZE}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CwAiChatComposer
