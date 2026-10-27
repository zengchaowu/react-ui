import './cw-chat-message-composer-mobile-shell.css'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { APP_PAGE_CHROME_SAFE_BOTTOM_CLASS } from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import CwIcon from '../CwIcon/CwIcon'
import { useCwAiChatComposerVoiceHold } from '../CwAiChatComposer/useCwAiChatComposerVoiceHold'
import {
  countComposerVisualRows,
  COMPOSER_MOBILE_BTN_REM,
  COMPOSER_MOBILE_SEND_BTN_REM,
  COMPOSER_MOBILE_SHELL_PAD_X_REM,
  COMPOSER_MOBILE_SHELL_PAD_Y_REM,
} from '../CwAiChatComposer/constants'
import {
  COMPOSER_MOBILE_ABSOLUTE_LAYOUT_TRANSITION,
  COMPOSER_SHELL_HEIGHT_TRANSITION,
  computeComposerLayoutGeometry,
  toAbsoluteStyle,
} from '../CwAiChatComposer/layoutGeometry'
import { useCwAiChatComposerContentRows } from '../CwAiChatComposer/useCwAiChatComposerContentRows'
import type {
  CwChatMessageComposerMobileShellEmits,
  CwChatMessageComposerMobileShellHandle,
  CwChatMessageComposerMobileShellProps,
  CwChatMessageComposerMobileShellTexts,
} from './types'
import { defaultCwChatMessageComposerMobileShellTexts } from './mobileShellTexts'
import { mobileComposerInputSurfaceClass, composerBase } from './styles'
import CwChatMessageComposerMobileVoiceOverlay from './CwChatMessageComposerMobileVoiceOverlay'

const ACTION_ICON_SIZE = 1.75

const actionIconStyles = {
  size: ACTION_ICON_SIZE,
  class: 'text-current',
} as const

const stopActionIconStyles = {
  size: ACTION_ICON_SIZE,
  class: 'text-[var(--error-color-6)]',
} as const

export interface CwChatMessageComposerMobileShellComponentProps
  extends CwChatMessageComposerMobileShellProps,
    CwChatMessageComposerMobileShellEmits {}

export const CwChatMessageComposerMobileShell = forwardRef<
  CwChatMessageComposerMobileShellHandle,
  CwChatMessageComposerMobileShellComponentProps
>(function CwChatMessageComposerMobileShell(
  {
    disabled = false,
    minRows: minRowsProp = 1,
    maxRows: maxRowsProp = 4,
    messageInputRef,
    showVoice = true,
    showEmoji = true,
    showMore = true,
    stopReplyActive = false,
    outboundHoldActive = false,
    emojiActive = false,
    moreActive = false,
    insetSafeAreaBottom = false,
    texts: textsProp,
    voiceWaveformLevels,
    editorPlainText = '',
    pendingAttachmentCount: _pendingAttachmentCount,
    children,
    onVoiceToggle,
    onVoiceModeChange,
    onVoiceRecordStart,
    onVoiceRecordEnd,
    onEmojiToggle,
    onMoreToggle,
    onSend,
    onStopAiReply,
  },
  ref,
) {
  const texts = useMemo<CwChatMessageComposerMobileShellTexts>(
    () => ({
      ...defaultCwChatMessageComposerMobileShellTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const aiStreamActive = Boolean(stopReplyActive) && !disabled
  const replacePrimaryWithStop = aiStreamActive && Boolean(outboundHoldActive)
  const showStandaloneStop = aiStreamActive && !outboundHoldActive

  const [isVoiceMode, setIsVoiceMode] = useState(false)

  const editorShellRef = useRef<HTMLDivElement | null>(null)

  const minRowsComputed = Math.max(1, minRowsProp ?? 1)
  const maxRowsComputed = Math.max(minRowsComputed, maxRowsProp ?? 4)

  const resolveMessageInput = () => messageInputRef?.current ?? null

  const showSendAction =
    !replacePrimaryWithStop &&
    !disabled &&
    !isVoiceMode &&
    (resolveMessageInput()?.canSubmit() ?? false)

  const newlineVisualRows = countComposerVisualRows(editorPlainText)

  const layoutRevision = [
    newlineVisualRows,
    maxRowsComputed,
    editorPlainText.length,
    isVoiceMode,
    showEmoji,
    showMore,
    showSendAction,
  ].join('|')

  const { measuredRows } = useCwAiChatComposerContentRows({
    editorShellRef,
    minRows: minRowsComputed,
    maxRows: maxRowsComputed,
    layoutRevision,
  })

  const visualRows = isVoiceMode
    ? 1
    : Math.min(
        Math.max(Math.max(newlineVisualRows, measuredRows), minRowsComputed),
        maxRowsComputed,
      )

  const isInlineLayout = visualRows <= 1

  const showAttachForLayout = showEmoji
  const showMoreForLayout = showMore || aiStreamActive || showStandaloneStop

  const geometry = useMemo(
    () =>
      computeComposerLayoutGeometry({
        mode: 'inline',
        visualRows,
        showVoice,
        showAttach: showAttachForLayout,
        showSend: showMoreForLayout,
        sendActionActive: showSendAction,
        sendBtnRem: COMPOSER_MOBILE_SEND_BTN_REM,
        shellPadXRem: COMPOSER_MOBILE_SHELL_PAD_X_REM,
        shellPadYRem: COMPOSER_MOBILE_SHELL_PAD_Y_REM,
        btnRem: COMPOSER_MOBILE_BTN_REM,
        expandEditorToRow: true,
      }),
    [
      visualRows,
      showVoice,
      showAttachForLayout,
      showMoreForLayout,
      showSendAction,
    ],
  )

  const shellLayoutStyle: CSSProperties = {
    height: `${geometry.shellHeightRem}rem`,
    transition: COMPOSER_SHELL_HEIGHT_TRANSITION,
  }
  const editorLayoutStyle: CSSProperties = toAbsoluteStyle(
    geometry.editor,
    COMPOSER_MOBILE_ABSOLUTE_LAYOUT_TRANSITION,
  )
  const voiceLayoutStyle: CSSProperties = geometry.voice
    ? toAbsoluteStyle(geometry.voice, COMPOSER_MOBILE_ABSOLUTE_LAYOUT_TRANSITION)
    : {}
  const actionsLayoutStyle: CSSProperties = toAbsoluteStyle(
    geometry.actions,
    COMPOSER_MOBILE_ABSOLUTE_LAYOUT_TRANSITION,
  )

  const voiceInputDisabled = disabled || !isVoiceMode

  const {
    isRecording: isVoiceRecording,
    gestureZone,
    onPointerDown: onVoiceHoldPointerDown,
    onPointerMove: onVoiceHoldPointerMove,
    onPointerUp: onVoiceHoldPointerUp,
    onPointerCancel: onVoiceHoldPointerCancel,
    cancelActiveHold,
  } = useCwAiChatComposerVoiceHold({
    disabled: voiceInputDisabled,
    mode: 'wechat-overlay',
    onStart: () => onVoiceRecordStart?.(),
    onEnd: (payload) => onVoiceRecordEnd?.(payload),
  })

  function exitVoiceMode() {
    if (!isVoiceMode) return
    cancelActiveHold()
    setIsVoiceMode(false)
    onVoiceModeChange?.(false)
  }

  function enterVoiceMode() {
    if (disabled) return
    setIsVoiceMode(true)
    resolveMessageInput()?.getEditor()?.commands.blur()
    onVoiceModeChange?.(true)
    onVoiceToggle?.()
  }

  useEffect(() => {
    if (disabled && isVoiceMode) {
      cancelActiveHold()
      setIsVoiceMode(false)
      onVoiceModeChange?.(false)
    }
    // 仅在禁用态变化时检查
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled])

  useEffect(() => {
    if (!aiStreamActive) return
    if (!isVoiceMode) return
    cancelActiveHold()
    setIsVoiceMode(false)
    onVoiceModeChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiStreamActive])

  useImperativeHandle(
    ref,
    () => ({
      exitVoiceMode,
      isVoiceMode: () => isVoiceMode,
    }),
    [isVoiceMode],
  )

  function onVoiceToggleClick() {
    if (disabled) return
    if (isVoiceMode) {
      exitVoiceMode()
      return
    }
    enterVoiceMode()
  }

  function onEmojiToggleClick() {
    if (disabled) return
    onEmojiToggle?.()
  }

  function onMoreToggleClick() {
    if (disabled) return
    onMoreToggle?.()
  }

  function onStandaloneStopClick() {
    if (disabled) return
    onStopAiReply?.()
  }

  function onPrimaryActionClick() {
    if (disabled) return
    if (replacePrimaryWithStop) {
      onStopAiReply?.()
      return
    }
    if (showSendAction) {
      onSend?.()
      return
    }
    onMoreToggleClick()
  }

  const primaryActionAriaLabel = replacePrimaryWithStop
    ? texts.stopAriaLabel
    : showSendAction
      ? texts.sendAriaLabel
      : texts.moreAriaLabel

  const showMorePressed =
    !replacePrimaryWithStop && !showSendAction && moreActive

  const shellRootClass = [
    composerBase.mobileShell,
    insetSafeAreaBottom ? APP_PAGE_CHROME_SAFE_BOTTOM_CLASS : '',
  ]
    .filter(Boolean)
    .join(' ')

  const voiceBtnClass = composerBase.mobileSideBtn
  const emojiBtnClass = [
    composerBase.mobileSideBtn,
    emojiActive ? composerBase.mobileSideBtnActive : '',
  ]
    .filter(Boolean)
    .join(' ')

  const primaryActionBtnClass = replacePrimaryWithStop
    ? [
        'cw-composer-mobile-primary-action cw-composer-mobile-primary-action--more',
        composerBase.mobileSideBtn,
      ]
        .filter(Boolean)
        .join(' ')
    : showSendAction
      ? [
          'cw-composer-mobile-primary-action cw-composer-mobile-primary-action--send',
          composerBase.mobileSendBtn,
        ]
          .filter(Boolean)
          .join(' ')
      : [
          'cw-composer-mobile-primary-action cw-composer-mobile-primary-action--more',
          composerBase.mobileSideBtn,
          moreActive ? composerBase.mobileSideBtnActive : '',
        ]
          .filter(Boolean)
          .join(' ')

  const primaryActionBtnStyle = {
    '--composer-mobile-btn-width': `${COMPOSER_MOBILE_BTN_REM}rem`,
    '--composer-mobile-send-btn-width': `${COMPOSER_MOBILE_SEND_BTN_REM}rem`,
  } as CSSProperties

  const voiceHoldIdleClass = (() => {
    const base = [
      'cw-chat-message-composer-mobile__voice-hold absolute z-[var(--z-index-above)] box-border flex w-full cursor-pointer touch-none select-none items-center justify-center',
      mobileComposerInputSurfaceClass,
      '[font-size:var(--font-size-body-lg)] font-medium leading-[var(--line-height-composer)] text-[var(--text-color-secondary)] transition-[background-color,color] duration-150 ease-out',
    ].join(' ')
    if (disabled || !isVoiceMode) {
      return `${base} cursor-not-allowed opacity-55 pointer-events-none`
    }
    return base
  })()

  return (
    <div
      className={[
        shellRootClass,
        isVoiceRecording
          ? 'overflow-visible [&_.cw-chat-message-composer-mobile__inner]:invisible'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isVoiceRecording ? (
        <CwChatMessageComposerMobileVoiceOverlay
          gestureZone={gestureZone}
          texts={texts}
          voiceWaveformLevels={voiceWaveformLevels}
        />
      ) : null}

      <div
        className="cw-chat-message-composer-mobile__inner relative box-border overflow-hidden"
        style={shellLayoutStyle}
      >
        {isVoiceMode ? (
          <div
            style={editorLayoutStyle}
            className={voiceHoldIdleClass}
            aria-label={texts.holdToSpeakLabel}
            onPointerDown={onVoiceHoldPointerDown}
            onPointerMove={onVoiceHoldPointerMove}
            onPointerUp={onVoiceHoldPointerUp}
            onPointerCancel={onVoiceHoldPointerCancel}
            onContextMenu={(event) => event.preventDefault()}
          >
            <span>{texts.holdToSpeakLabel}</span>
          </div>
        ) : null}

        {showVoice ? (
          <div
            className="cw-chat-message-composer-mobile__voice z-[var(--z-index-above)] flex items-center justify-center"
            style={voiceLayoutStyle}
          >
            <div
              role="button"
              tabIndex={0}
              className={voiceBtnClass}
              aria-label={
                isVoiceMode ? texts.keyboardAriaLabel : texts.voiceAriaLabel
              }
              aria-disabled={disabled ? 'true' : undefined}
              onClick={onVoiceToggleClick}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onVoiceToggleClick()
              }}
            >
              <CwIcon
                name={
                  isVoiceMode
                    ? 'chat--msg--keyboard-line'
                    : 'chat--call--voice-line'
                }
                prefix="icon"
                size={actionIconStyles.size ?? 1}
                className={actionIconStyles.class}
              />
            </div>
          </div>
        ) : null}

        <div
          ref={editorShellRef}
          className={[
            'cw-chat-message-composer-mobile__editor z-[var(--z-index-base)] min-w-0',
            isInlineLayout
              ? 'cw-chat-message-composer-mobile__editor--inline'
              : '',
            isVoiceMode
              ? 'pointer-events-none overflow-hidden'
              : mobileComposerInputSurfaceClass,
          ]
            .filter(Boolean)
            .join(' ')}
          style={editorLayoutStyle}
        >
          <div
            className={['h-full min-h-0', isVoiceMode ? 'opacity-0' : '']
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </div>

        {showEmoji || showMore || aiStreamActive ? (
          <div
            className="cw-chat-message-composer-mobile__actions z-[var(--z-index-above)] flex items-center justify-end gap-1.5"
            style={actionsLayoutStyle}
          >
            {showEmoji ? (
              <div
                role="button"
                tabIndex={0}
                className={emojiBtnClass}
                aria-label={texts.emojiAriaLabel}
                aria-pressed={emojiActive ? 'true' : 'false'}
                aria-disabled={disabled ? 'true' : undefined}
                onClick={onEmojiToggleClick}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onEmojiToggleClick()
                }}
              >
                <CwIcon
                  name="chat--msg--emoji-line"
                  prefix="icon"
                  size={actionIconStyles.size ?? 1}
                  className={actionIconStyles.class}
                />
              </div>
            ) : null}
            {showStandaloneStop ? (
              <div
                role="button"
                tabIndex={0}
                className={[
                  'cw-composer-mobile-primary-action cw-composer-mobile-primary-action--more',
                  composerBase.mobileSideBtn,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={texts.stopAriaLabel}
                aria-disabled={disabled ? 'true' : undefined}
                onClick={onStandaloneStopClick}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onStandaloneStopClick()
                }}
              >
                <CwIcon
                  name="common--status--stop-filled"
                  prefix="icon"
                  size={stopActionIconStyles.size ?? 1}
                  className={stopActionIconStyles.class}
                />
              </div>
            ) : null}
            {showMore || replacePrimaryWithStop || showSendAction ? (
              <div
                role="button"
                tabIndex={0}
                className={primaryActionBtnClass}
                style={primaryActionBtnStyle}
                aria-label={primaryActionAriaLabel}
                aria-pressed={showMorePressed ? 'true' : 'false'}
                aria-disabled={disabled ? 'true' : undefined}
                onClick={onPrimaryActionClick}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onPrimaryActionClick()
                }}
              >
                <div className="cw-composer-mobile-primary-action__content">
                  {showSendAction ? (
                    <span className="cw-composer-mobile-primary-action__label">
                      {texts.sendLabel}
                    </span>
                  ) : replacePrimaryWithStop ? (
                    <CwIcon
                      name="common--status--stop-filled"
                      prefix="icon"
                      size={stopActionIconStyles.size ?? 1}
                      className={stopActionIconStyles.class}
                    />
                  ) : (
                    <CwIcon
                      name="common--action--circle-add-line"
                      prefix="icon"
                      size={actionIconStyles.size ?? 1}
                      className={actionIconStyles.class}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
})

export default CwChatMessageComposerMobileShell
