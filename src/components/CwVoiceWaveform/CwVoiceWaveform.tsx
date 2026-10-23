import type { CSSProperties } from 'react'
import type { CwVoiceWaveformProps } from './types'

export function CwVoiceWaveform({
  levels,
  barCount = 12,
  barWidth = 3,
  barGap = 3,
  height = 2.25,
  minHeightRatio = 0.22,
  maxHeightRatio = 1,
  barClass = 'bg-[var(--chat-voice-waveform-bar-fg)]',
  rootClass = '',
  className,
  style,
  ...rest
}: CwVoiceWaveformProps) {
  const rootStyle = {
    height: `${height}rem`,
    gap: `${barGap}px`,
    '--cw-voice-waveform-min-height': `${minHeightRatio * 100}%`,
    '--cw-voice-waveform-max-height': `${maxHeightRatio * 100}%`,
    ...style,
  } as CSSProperties

  const useDecorative = !levels || levels.length === 0

  const displayLevels = useDecorative
    ? Array.from({ length: barCount }, (_, index) => index)
    : levels.slice(0, barCount)

  function clampLevel(level: number): number {
    return Math.min(maxHeightRatio, Math.max(minHeightRatio, level))
  }

  function barStyle(level: number, index: number): CSSProperties {
    const widthStyle = { width: `${barWidth}px` }
    if (useDecorative) {
      return {
        ...widthStyle,
        animationDelay: `${index * 0.07}s`,
      }
    }
    const ratio = clampLevel(level)
    return {
      ...widthStyle,
      height: `${ratio * 100}%`,
    }
  }

  return (
    <div
      {...rest}
      className={['flex items-center justify-center', rootClass, className]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
      aria-hidden="true"
    >
      {displayLevels.map((level, index) => (
        <span
          key={index}
          className={[
            'shrink-0 rounded-full transition-[height] duration-75 ease-out',
            barClass,
            useDecorative ? 'cw-voice-waveform-bar--decorative' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={barStyle(level, index)}
        />
      ))}
    </div>
  )
}

export default CwVoiceWaveform
