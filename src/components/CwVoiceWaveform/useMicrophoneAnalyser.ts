import { useEffect, useRef, useState } from 'react'
import { bucketFrequencyLevels } from './bucketFrequencyLevels'

export interface UseMicrophoneAnalyserOptions {
  barCount?: number
  minLevel?: number
  maxLevel?: number
}

export function useMicrophoneAnalyser(options: UseMicrophoneAnalyserOptions = {}) {
  const barCount = Math.max(1, options.barCount ?? 12)
  const minLevel = options.minLevel ?? 0.22
  const maxLevel = options.maxLevel ?? 1

  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => minLevel),
  )
  const [isActive, setIsActive] = useState(false)

  const isActiveRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const rafIdRef = useRef(0)
  const freqBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const smoothedRef = useRef<number[]>(
    Array.from({ length: barCount }, () => minLevel),
  )

  function tick() {
    const analyserNode = analyserNodeRef.current
    const freqBuffer = freqBufferRef.current
    if (!analyserNode || !freqBuffer) return
    analyserNode.getByteFrequencyData(freqBuffer)
    const next = bucketFrequencyLevels(freqBuffer, barCount, minLevel, maxLevel)
    for (let i = 0; i < barCount; i++) {
      smoothedRef.current[i] =
        (smoothedRef.current[i] ?? minLevel) * 0.5 + (next[i] ?? minLevel) * 0.5
    }
    setLevels([...smoothedRef.current])
    rafIdRef.current = requestAnimationFrame(tick)
  }

  async function start(): Promise<void> {
    if (isActiveRef.current) return
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前环境不支持麦克风访问')
    }

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    audioContextRef.current = audioContext
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.minDecibels = -90
    analyserNode.maxDecibels = -10
    analyserNode.smoothingTimeConstant = 0.82
    analyserNodeRef.current = analyserNode

    const source = audioContext.createMediaStreamSource(streamRef.current)
    source.connect(analyserNode)

    freqBufferRef.current = new Uint8Array(analyserNode.frequencyBinCount)
    smoothedRef.current = Array.from({ length: barCount }, () => minLevel)
    isActiveRef.current = true
    setIsActive(true)
    tick()
  }

  async function stop(): Promise<void> {
    cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = 0
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    analyserNodeRef.current = null
    freqBufferRef.current = null
    const audioContext = audioContextRef.current
    if (audioContext) {
      try {
        await audioContext.close()
      } catch {
        // ignore
      }
      audioContextRef.current = null
    }
    isActiveRef.current = false
    setIsActive(false)
    smoothedRef.current = Array.from({ length: barCount }, () => minLevel)
    setLevels([...smoothedRef.current])
  }

  useEffect(() => {
    return () => {
      void stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    levels,
    isActive,
    start,
    stop,
  }
}
