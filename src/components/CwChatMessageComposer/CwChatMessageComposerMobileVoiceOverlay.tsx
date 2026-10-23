import { createPortal } from 'react-dom'
import { APP_PAGE_CHROME_SAFE_BOTTOM_CLASS } from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import CwVoiceWaveform from '../CwVoiceWaveform/CwVoiceWaveform'
import type { VoiceHoldGestureZone } from '../CwAiChatComposer/voiceHoldTypes'
import type { CwChatMessageComposerMobileShellTexts } from './types'

export interface CwChatMessageComposerMobileVoiceOverlayProps {
  gestureZone: VoiceHoldGestureZone
  texts: CwChatMessageComposerMobileShellTexts
  voiceWaveformLevels?: number[]
}

function pillClass(zone: 'cancel' | 'convertText', gestureZone: VoiceHoldGestureZone) {
  const active = gestureZone === zone
  return active
    ? 'bg-[color-mix(in_srgb,var(--text-color-anti)_28%,transparent)] scale-105'
    : 'bg-[color-mix(in_srgb,var(--text-color-anti)_14%,transparent)] opacity-90'
}

export function CwChatMessageComposerMobileVoiceOverlay({
  gestureZone,
  texts,
  voiceWaveformLevels,
}: CwChatMessageComposerMobileVoiceOverlayProps) {
  const feedbackBubbleClass =
    gestureZone === 'cancel'
      ? 'bg-[var(--chat-voice-recording-cancel-bg)]'
      : 'bg-[var(--chat-voice-recording-hold-bg)]'

  const feedbackBubbleText =
    gestureZone === 'cancel'
      ? texts.voiceRecordingCancelHint
      : texts.voiceRecordingConvertHint

  const arcHint =
    gestureZone === 'convertText'
      ? texts.voiceRecordingConvertHint
      : texts.voiceRecordingHint

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="cw-chat-message-composer-mobile-voice-overlay pointer-events-none fixed inset-0 z-[var(--z-index-modal)] flex flex-col"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[color-mix(in_srgb,#000_72%,transparent)]" />

      <div
        className={[
          'absolute left-1/2 top-[34%] z-[var(--z-index-above)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-150',
          gestureZone === 'cancel' ? 'scale-105' : 'scale-100',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'relative min-w-[8.5rem] rounded-xl px-5 py-3.5 transition-colors duration-150',
            feedbackBubbleClass,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {gestureZone === 'hold' ? (
            <CwVoiceWaveform
              levels={voiceWaveformLevels}
              barCount={12}
              barClass="bg-[var(--chat-voice-waveform-bar-fg)]"
            />
          ) : (
            <p className="mb-0 whitespace-nowrap text-center [font-size:var(--font-size-body-lg)] font-medium leading-snug text-[var(--text-color-anti)]">
              {feedbackBubbleText}
            </p>
          )}
          <div
            className={[
              'absolute left-1/2 bottom-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 transition-colors duration-150',
              feedbackBubbleClass,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-[var(--z-index-above)] flex items-center justify-between gap-3 px-8"
        style={{ bottom: 'calc(6.75rem + var(--app-page-chrome-safe-bottom))' }}
      >
        <div
          className={[
            'rounded-full px-5 py-2.5 [font-size:var(--font-size-body-lg)] text-[var(--text-color-anti)] transition-all duration-150',
            pillClass('cancel', gestureZone),
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {texts.voiceCancelLabel}
        </div>
        <div
          className={[
            'rounded-full px-5 py-2.5 [font-size:var(--font-size-body-lg)] text-[var(--text-color-anti)] transition-all duration-150',
            pillClass('convertText', gestureZone),
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {texts.voiceConvertTextLabel}
        </div>
      </div>

      <div
        className={[
          'relative z-[var(--z-index-above)] mt-auto h-[5.75rem] shrink-0',
          APP_PAGE_CHROME_SAFE_BOTTOM_CLASS,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="absolute inset-x-0 bottom-0 top-5 bg-[var(--chat-voice-recording-dock-bg)] transition-colors duration-150" />
        <div className="absolute left-1/2 top-0 h-[3.25rem] w-[145%] -translate-x-1/2 rounded-[50%] bg-[var(--chat-voice-recording-dock-bg)] transition-colors duration-150" />
        <p className="relative z-[var(--z-index-above)] mb-0 pt-5 text-center [font-size:var(--font-size-body-lg)] font-medium leading-snug text-[var(--text-color-anti)]">
          {arcHint}
        </p>
      </div>
    </div>,
    document.body,
  )
}

export default CwChatMessageComposerMobileVoiceOverlay
