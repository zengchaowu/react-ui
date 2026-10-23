import { useEffect, useRef, useState } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import { showCwToast } from '../CwToast'
import { chatOwnBubbleBodyClasses } from './chatMessageBubbleSurface'
import {
  chatVoiceBubbleWidthRem,
  formatChatVoiceDurationLabel,
} from './chatVoiceBubbleLayout'
import { useChatVoiceIconFrame } from './useChatVoiceIconFrame'
import { useChatVoiceMessagePlayback } from './useChatVoiceMessagePlayback'
import { chatMessageOwnLeadingActionClass } from './chatMessageOwnLeadingAction'
import type { CwChatMessageVoiceProps } from './messageParts.types'

const chatOwnVoiceBubbleClasses = [
  chatOwnBubbleBodyClasses,
  'rounded-[0.25rem] shadow-none text-left',
].join(' ')

const chatPeerVoiceBubbleClasses = [
  'rounded-[0.25rem] border-0 bg-[var(--chat-message-bubble-peer-bg)] text-[var(--text-color-primary)] shadow-none text-left',
].join(' ')

const voiceIconStyles = {
  size: 1.25,
  class: 'inline-flex shrink-0 items-center justify-center leading-none',
} as const

export function CwChatMessageVoice({
  chatMessageId,
  audioUrl,
  durationSec = 1,
  showOnRight = false,
  isUploading = false,
  uploadFailed = false,
  transcript = '',
  leadingSlot,
  onClick,
}: CwChatMessageVoiceProps) {
  /** 只挂在语音条上，转写块不参与定位，图标与语音条垂直居中。 */
  const showOwnLeadingAction = showOnRight && leadingSlot !== undefined

  const playback = useChatVoiceMessagePlayback()

  const [resolvedDurationSec, setResolvedDurationSec] = useState(
    Math.max(1, Math.round(durationSec ?? 1)),
  )

  const transcriptText = transcript?.trim() || ''

  useEffect(() => {
    if (durationSec != null && durationSec > 0) {
      setResolvedDurationSec(Math.max(1, Math.round(durationSec)))
    }
  }, [durationSec])

  useEffect(() => {
    const trimmed = audioUrl?.trim()
    if (!trimmed || (durationSec != null && durationSec > 1)) return
    const audio = new Audio(trimmed)
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setResolvedDurationSec(Math.max(1, Math.round(audio.duration)))
      }
      audio.removeEventListener('loadedmetadata', onMeta)
    }
    audio.addEventListener('loadedmetadata', onMeta)
    return () => {
      audio.removeEventListener('loadedmetadata', onMeta)
    }
  }, [audioUrl, durationSec])

  const durationLabel = formatChatVoiceDurationLabel(resolvedDurationSec)
  const bubbleShellStyle = {
    width: `${chatVoiceBubbleWidthRem(resolvedDurationSec)}rem`,
    maxWidth: '72vw',
  }

  const isPlaying = playback.isPlaying(String(chatMessageId)) && !isUploading
  const { iconName: voiceIconName } = useChatVoiceIconFrame(isPlaying)

  const showUnreadDot =
    !showOnRight &&
    !isUploading &&
    !uploadFailed &&
    Boolean(audioUrl?.trim()) &&
    !playback.isPlayed(String(chatMessageId))

  async function onTogglePlay() {
    if (isUploading || uploadFailed || !audioUrl.trim()) {
      onClick?.()
      return
    }
    const { result, detail } = await playback.toggle(
      String(chatMessageId),
      audioUrl,
    )
    if (result === 'blocked') {
      showCwToast({ message: '无法播放语音，请检查媒体音量', type: 'text' })
    } else if (result === 'media-error') {
      showCwToast({
        message: `语音文件播放失败${detail ? `：${detail}` : ''}`,
        type: 'text',
      })
    }
    onClick?.()
  }

  const playbackRef = useRef(playback)
  playbackRef.current = playback
  const messageIdRef = useRef(String(chatMessageId))
  messageIdRef.current = String(chatMessageId)

  useEffect(() => {
    if (isUploading && playbackRef.current.isPlaying(messageIdRef.current)) {
      playbackRef.current.stop()
    }
  }, [isUploading])

  useEffect(
    () => () => {
      if (playbackRef.current.isPlaying(messageIdRef.current)) {
        playbackRef.current.stop()
      }
    },
    [],
  )

  return (
    <div
      className={[
        'flex w-fit max-w-full min-w-0 flex-col gap-1.5',
        showOnRight ? 'ml-auto items-end' : 'items-start',
      ].join(' ')}
    >
      <div
        className={[
          'relative flex w-fit max-w-full min-w-0 items-center gap-1.5',
          showOnRight ? 'ml-auto' : '',
          showOwnLeadingAction ? 'group/own-bubble' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showOwnLeadingAction ? (
          <div className={chatMessageOwnLeadingActionClass}>{leadingSlot}</div>
        ) : null}
        <div className="relative shrink-0" style={bubbleShellStyle}>
          {!showOnRight ? (
            <span
              className="pointer-events-none absolute top-[0.8125rem] -left-[0.3125rem] z-[var(--z-index-above)] h-0 w-0 border-y-[0.3125rem] border-r-[0.375rem] border-y-transparent border-r-[var(--chat-message-bubble-peer-bg)]"
              aria-hidden="true"
            />
          ) : (
            <span
              className="pointer-events-none absolute top-[0.8125rem] -right-[0.3125rem] z-[var(--z-index-above)] h-0 w-0 border-y-[0.3125rem] border-l-[0.375rem] border-y-transparent border-l-[var(--chat-message-bubble-own-bg)]"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            data-chat-message-id={chatMessageId}
            data-cw-chat-message-bubble-body=""
            className={[
              'relative box-border flex h-10 w-full min-w-0 cursor-pointer items-center gap-1 border-0 px-3 py-0 transition-opacity active:opacity-90',
              showOnRight ? 'justify-end' : 'justify-start',
              showOnRight ? chatOwnVoiceBubbleClasses : chatPeerVoiceBubbleClasses,
              isUploading || uploadFailed ? 'pointer-events-none opacity-70' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={isUploading || uploadFailed || !audioUrl}
            aria-label={isPlaying ? '暂停语音' : '播放语音'}
            onClick={() => {
              void onTogglePlay()
            }}
          >
            {!showOnRight ? (
              <CwIcon
                name={voiceIconName}
                prefix="icon"
                size={voiceIconStyles.size}
                className={[voiceIconStyles.class, 'scale-x-[-1]'].join(' ')}
              />
            ) : null}
            <span className="shrink-0 select-none tabular-nums leading-none [font-size:var(--font-size-body)]" aria-hidden="true">
              {durationLabel}
            </span>
            {showOnRight ? (
              <CwIcon
                name={voiceIconName}
                prefix="icon"
                size={voiceIconStyles.size}
                className={voiceIconStyles.class}
              />
            ) : null}
            {isUploading ? (
              <span className="sr-only">上传中</span>
            ) : uploadFailed ? (
              <span className="sr-only">上传失败</span>
            ) : null}
          </button>
        </div>

        {!showOnRight && showUnreadDot ? (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-[var(--chat-voice-unread-dot)]"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {transcriptText ? (
        <div
          className={[
            'box-border max-w-[min(18rem,72vw)] rounded-[0.25rem] px-2.5 py-1.5 [font-size:var(--font-size-caption)] leading-snug break-words whitespace-pre-wrap text-[var(--text-color-secondary)]',
            showOnRight
              ? 'bg-[color-mix(in_srgb,var(--chat-message-bubble-own-bg)_55%,transparent)] text-right'
              : 'bg-[color-mix(in_srgb,var(--chat-message-bubble-peer-bg)_85%,transparent)] text-left',
          ].join(' ')}
          data-cw-chat-message-voice-transcript=""
        >
          {transcriptText}
        </div>
      ) : null}
    </div>
  )
}

export default CwChatMessageVoice
