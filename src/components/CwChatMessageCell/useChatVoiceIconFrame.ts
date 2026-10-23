import { useEffect, useState } from 'react'

const VOICE_ICON_FRAMES = [
  'chat--call--voice-1-line',
  'chat--call--voice-2-line',
  'chat--call--voice-3-line',
] as const
const FRAME_INTERVAL_MS = 420

/** 微信式语音图标：静止 voice-3，播放时 voice-1→2→3 循环 */
export function useChatVoiceIconFrame(isPlaying: boolean): { iconName: string } {
  const [frameIndex, setFrameIndex] = useState(2)

  useEffect(() => {
    if (!isPlaying) {
      setFrameIndex(2)
      return
    }
    setFrameIndex(0)
    const timer = setInterval(() => {
      setFrameIndex((index) => (index + 1) % VOICE_ICON_FRAMES.length)
    }, FRAME_INTERVAL_MS)
    return () => {
      clearInterval(timer)
    }
  }, [isPlaying])

  const iconName =
    VOICE_ICON_FRAMES[frameIndex] ?? 'chat--call--voice-3-line'
  return { iconName }
}
