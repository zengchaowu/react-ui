import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TpGsap } from './TpGsap'

gsap.registerPlugin(
  ScrollTrigger,
  DrawSVGPlugin,
  MotionPathPlugin,
  ScrambleTextPlugin,
  Flip,
  CustomEase,
)

const meta: Meta<typeof TpGsap> = {
  title: '2. Third Party/3D & Graphics/TpGsap',
  component: TpGsap,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '一条官网长页把 GSAP 核心过一遍：补间、时间轴、滚动视差、路径、文字、布局翻转和缓动。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

interface FromToArgs {
  selector: gsap.TweenTarget
  rotation: number
  x: number
  duration: number
}

function FromToDemo({ args }: { args: FromToArgs }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // gsap.to
      gsap.to('.box.to', {
        rotation: args.rotation,
        x: args.x,
        duration: args.duration,
      })
      // gsap.from
      gsap.from('.box.from', {
        rotation: args.rotation,
        x: args.x,
        duration: args.duration,
      })
      // gsap.fromTo
      gsap.fromTo(
        '.box.fromto',
        { opacity: 0, x: 0 },
        {
          opacity: 1,
          rotation: args.rotation,
          x: args.x,
          duration: args.duration,
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [args.rotation, args.x, args.duration])

  return (
    <div ref={rootRef} className="space-y-4">
      <div>
        <div className="box to w-12 h-12 rounded bg-[var(--button-brand-tint-hover-bg)]0" />
      </div>
      <div>
        <div className="box from w-12 h-12 rounded bg-[var(--success-color-6)]" />
      </div>
      <div>
        <div className="box fromto w-12 h-12 rounded bg-[var(--error-color-6)]" />
      </div>
    </div>
  )
}

export const FromTo: StoryObj<FromToArgs> = {
  args: {
    selector: '.box',
    rotation: 27,
    x: 100,
    duration: 8,
  },
  argTypes: {
    duration: {
      control: { type: 'number', min: 0, step: 0.1 },
      description: '动画时长（秒）',
    },
    rotation: {
      control: { type: 'number', step: 1 },
      description: '旋转角度（deg）',
    },
    x: {
      control: { type: 'number', step: 1 },
      description: '水平位移（px）',
    },
  },
  render: (args) => <FromToDemo args={args} />,
}

interface TimelineArgs {
  duration: number
  ease: string
  paused: boolean
}

function TimelineDemo({ args }: { args: TimelineArgs }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: args.duration, ease: args.ease },
        paused: args.paused,
      })
      tl.to('.box-tl.one', { x: 80, rotation: 25 })
        .from('.box-tl.two', { x: -60, opacity: 0 })
        .fromTo(
          '.box-tl.three',
          { scale: 0.6, opacity: 0.7 },
          { scale: 1, opacity: 1, x: 60 },
        )

      if (!args.paused) tl.play()
    }, rootRef)

    return () => ctx.revert()
  }, [args.duration, args.ease, args.paused])

  return (
    <div ref={rootRef} className="space-y-4">
      <div>
        <div className="box-tl one w-12 h-12 rounded bg-violet-500" />
      </div>
      <div>
        <div className="box-tl two w-12 h-12 rounded bg-amber-500" />
      </div>
      <div>
        <div className="box-tl three w-12 h-12 rounded bg-emerald-500" />
      </div>
    </div>
  )
}

export const Timeline: StoryObj<TimelineArgs> = {
  args: {
    duration: 0.8,
    ease: 'power2.out',
    paused: false,
  },
  render: (args) => <TimelineDemo args={args} />,
}

const LANDING_SCENES = [
  {
    index: '01',
    title: '指针即镜头',
    body: '背景、设备和光斑不在一个平面上。鼠标一动，近处走得更多。',
  },
  {
    index: '02',
    title: '这一屏被钉住',
    body: '继续滚动时画面停在视口里，文案按进度换成下一句。',
  },
  {
    index: '03',
    title: '每层速度不同',
    body: '再往下，大字慢慢横移，三张卡片各自上浮或下沉。',
  },
]

const LANDING_CARDS = [
  { kicker: '远', title: '背景几乎不动', body: '模糊色块只轻轻让开。', shift: 'mt-0' },
  { kicker: '中', title: '设备跟着转', body: '指针偏到哪边，面板就朝哪边倾。', shift: 'mt-16' },
  { kicker: '近', title: '光斑跑在最前', body: '离你最近的一层，位移最大。', shift: 'mt-8' },
]

const LANDING_CHAPTERS = [
  { id: 'pin', label: '滚动钉住' },
  { id: 'reel', label: '时间轴' },
  { id: 'path', label: '路径' },
  { id: 'text', label: '文字' },
  { id: 'flip', label: '布局' },
  { id: 'ease', label: '缓动' },
]

const REEL_MARKS = [
  { id: 'to', name: 'to' },
  { id: 'fromTo', name: 'fromTo' },
  { id: 'stagger', name: 'stagger' },
  { id: 'settle', name: '缓动' },
]

const EASE_ROWS = [
  { label: 'power1.out', ease: 'power1.out' },
  { label: 'back.out', ease: 'back.out(1.7)' },
  { label: 'elastic.out', ease: 'elastic.out(1,0.5)' },
  { label: 'CustomEase', ease: 'lumen-ease' },
]

const TEXT_PHRASES = ['把补间排成一句', '文字可以边打边乱', '点一下，换成下一句']

const ROUTE_PATH = 'M40 150C140 30 240 190 360 90C480 -10 600 170 760 80'
const ROUTE_BEADS = [
  'var(--brand-color-6)',
  'var(--brand-color-4)',
  'var(--success-color-5)',
  'var(--warning-color-5)',
]

const FLIP_SEED = [
  { id: 'capture', title: '捕捉', body: '先记下现在的位置。' },
  { id: 'record', title: '记录', body: '布局一变，再量一次。' },
  { id: 'tween', title: '补间', body: '中间的帧会自己补上。' },
  { id: 'place', title: '落位', body: '换序、改大小都不跳。' },
]

function findLandingScroller(start: HTMLElement): HTMLElement | Window {
  let node = start.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight + 4) return node
    node = node.parentElement
  }
  return window
}

interface LandingArgs {
  strength: number
  scrub: number
}

function LandingDemo({ args }: { args: LandingArgs }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLElement | Window>(window)
  const showreelRef = useRef<gsap.core.Timeline | null>(null)
  const phraseTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const playEasesRef = useRef<() => void>(() => {})

  const [reelPlaying, setReelPlaying] = useState(false)
  const [reelProgress, setReelProgress] = useState(0)
  const [reelLabel, setReelLabel] = useState(REEL_MARKS[0].name)
  const [reelSpeed, setReelSpeed] = useState(1)
  const [flipItems, setFlipItems] = useState(FLIP_SEED.map((item) => ({ ...item })))
  const [flipStacked, setFlipStacked] = useState(false)

  const reelPercent = Math.round(reelProgress * 100)

  function scrollToPin() {
    rootRef.current?.querySelector('#pin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function go(id: string) {
    rootRef.current?.querySelector('#' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function replay() {
    const scroller = scrollerRef.current
    if (scroller === window) window.scrollTo({ top: 0, behavior: 'smooth' })
    else (scroller as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' })
  }

  function syncReel(tl: gsap.core.Timeline) {
    setReelProgress(tl.progress())
    let name = REEL_MARKS[0].name
    for (const mark of REEL_MARKS) {
      if (tl.time() + 0.001 >= tl.labels[mark.id]) name = mark.name
    }
    setReelLabel(name)
  }

  function toggleReel() {
    const showreel = showreelRef.current
    if (!showreel) return
    if (showreel.progress() === 1) {
      showreel.restart()
      setReelPlaying(true)
      return
    }
    if (showreel.paused()) {
      showreel.play()
      setReelPlaying(true)
      return
    }
    showreel.pause()
    setReelPlaying(false)
  }

  function reverseReel() {
    const showreel = showreelRef.current
    if (!showreel || showreel.progress() <= 0) return
    showreel.reverse()
    setReelPlaying(true)
  }

  function restartReel() {
    const showreel = showreelRef.current
    if (!showreel) return
    showreel.restart()
    setReelPlaying(true)
  }

  function setReelSpeedRate(rate: number) {
    setReelSpeed(rate)
    showreelRef.current?.timeScale(rate)
  }

  function scrubReel(event: React.ChangeEvent<HTMLInputElement>) {
    const showreel = showreelRef.current
    if (!showreel) return
    const next = Number(event.target.value)
    showreel.pause()
    showreel.progress(next)
    setReelPlaying(false)
    syncReel(showreel)
  }

  function seekReel(id: string) {
    const showreel = showreelRef.current
    if (!showreel) return
    const at = showreel.labels[id]
    if (at == null) return
    showreel.pause()
    showreel.seek(at)
    setReelPlaying(false)
    syncReel(showreel)
  }

  function nextPhrase() {
    const phraseTimeline = phraseTimelineRef.current
    if (!phraseTimeline) return
    const step = phraseTimeline.duration() / TEXT_PHRASES.length
    const next = (Math.floor(phraseTimeline.time() / step) + 1) % TEXT_PHRASES.length
    phraseTimeline.pause()
    phraseTimeline.time(next * step)
    phraseTimeline.play()
  }

  function toggleFlip() {
    const scope = rootRef.current
    if (!scope) return
    const nodes = scope.querySelectorAll('.flip-item')
    const state = Flip.getState(nodes)
    setFlipStacked((value) => !value)
    setFlipItems((items) => [...items].reverse())
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.75,
        ease: 'power3.inOut',
        absolute: true,
        stagger: 0.05,
      })
    })
  }

  useEffect(() => {
    const scope = rootRef.current
    if (!scope) return

    const scroller = findLandingScroller(scope)
    scrollerRef.current = scroller
    const strength = Number.isFinite(Number(args.strength)) ? Number(args.strength) : 1
    const scrubInput = Number(args.scrub)
    const scrub: number | boolean = scrubInput > 0 ? scrubInput : true

    const ctx = gsap.context(() => {
      const onScroller = <T extends Record<string, unknown>>(vars: T): T => {
        if (scroller !== window) (vars as Record<string, unknown>).scroller = scroller
        return vars
      }

      gsap.set('.cursor-glow', {
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      gsap.set('.feat-1, .feat-2', { autoAlpha: 0, y: 48 })
      gsap.set('.pin-fill', { scaleY: 0, transformOrigin: 'top center' })

      const blobX = {
        far: gsap.quickTo('.blob-far', 'x', { duration: 1.15, ease: 'power3.out' }),
        mid: gsap.quickTo('.blob-mid', 'x', { duration: 0.8, ease: 'power3.out' }),
        near: gsap.quickTo('.blob-near', 'x', { duration: 0.45, ease: 'power3.out' }),
      }
      const blobY = {
        far: gsap.quickTo('.blob-far', 'y', { duration: 1.15, ease: 'power3.out' }),
        mid: gsap.quickTo('.blob-mid', 'y', { duration: 0.8, ease: 'power3.out' }),
        near: gsap.quickTo('.blob-near', 'y', { duration: 0.45, ease: 'power3.out' }),
      }
      const copyX = gsap.quickTo('.hero-copy', 'x', { duration: 0.7, ease: 'power3.out' })
      const copyY = gsap.quickTo('.hero-copy', 'y', { duration: 0.7, ease: 'power3.out' })
      const tiltX = gsap.quickTo('.device-tilt', 'x', { duration: 0.6, ease: 'power3.out' })
      const rotX = gsap.quickTo('.device-tilt', 'rotationX', { duration: 0.55, ease: 'power3.out' })
      const rotY = gsap.quickTo('.device-tilt', 'rotationY', { duration: 0.55, ease: 'power3.out' })
      const innerX = gsap.quickTo('.device-inner', 'x', { duration: 0.45, ease: 'power3.out' })
      const innerY = gsap.quickTo('.device-inner', 'y', { duration: 0.45, ease: 'power3.out' })
      const glowX = gsap.quickTo('.cursor-glow', 'x', { duration: 0.45, ease: 'power3.out' })
      const glowY = gsap.quickTo('.cursor-glow', 'y', { duration: 0.45, ease: 'power3.out' })

      const onPointerMove = (event: PointerEvent) => {
        const px = (event.clientX / window.innerWidth - 0.5) * 2
        const py = (event.clientY / window.innerHeight - 0.5) * 2
        blobX.far(px * 16 * strength)
        blobY.far(py * 10 * strength)
        blobX.mid(px * -34 * strength)
        blobY.mid(py * -22 * strength)
        blobX.near(px * 72 * strength)
        blobY.near(py * 48 * strength)
        copyX(px * 12 * strength)
        copyY(py * 8 * strength)
        tiltX(px * 10 * strength)
        rotX(-py * 8 * strength)
        rotY(px * 10 * strength)
        innerX(px * -20 * strength)
        innerY(py * -14 * strength)
        glowX(event.clientX)
        glowY(event.clientY)
      }
      window.addEventListener('pointermove', onPointerMove)

      const magnetCleanups: Array<() => void> = []
      scope.querySelectorAll<HTMLElement>('.magnet').forEach((button) => {
        const onMagnetMove = (event: PointerEvent) => {
          const rect = button.getBoundingClientRect()
          const dx = event.clientX - (rect.left + rect.width / 2)
          const dy = event.clientY - (rect.top + rect.height / 2)
          gsap.to(button, { x: dx * 0.35, y: dy * 0.4, duration: 0.3, ease: 'power3.out' })
        }
        const onMagnetLeave = () => {
          gsap.to(button, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
        }
        button.addEventListener('pointermove', onMagnetMove)
        button.addEventListener('pointerleave', onMagnetLeave)
        magnetCleanups.push(() => {
          button.removeEventListener('pointermove', onMagnetMove)
          button.removeEventListener('pointerleave', onMagnetLeave)
        })
      })

      gsap.to('.device-float', {
        y: -12,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
      gsap.to('.scroll-cue', {
        y: 8,
        duration: 1.05,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      gsap.from('.hero-line', {
        yPercent: 115,
        duration: 1.15,
        stagger: 0.1,
        ease: 'power4.out',
      })
      gsap.from('.hero-fade', {
        autoAlpha: 0,
        y: 18,
        duration: 0.8,
        delay: 0.28,
        stagger: 0.08,
        ease: 'power2.out',
      })

      const hero = () =>
        onScroller({
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        })
      gsap.to('.blob-far-scroll', { yPercent: 16, ease: 'none', scrollTrigger: hero() })
      gsap.to('.blob-mid-scroll', { yPercent: 28, ease: 'none', scrollTrigger: hero() })
      gsap.to('.blob-near-scroll', { yPercent: -24, ease: 'none', scrollTrigger: hero() })
      gsap.to('.hero-copy-scroll', { yPercent: 22, ease: 'none', scrollTrigger: hero() })
      gsap.to('.device-wrap', { yPercent: -14, ease: 'none', scrollTrigger: hero() })

      const pin = gsap.timeline({
        scrollTrigger: onScroller({
          trigger: '.pin-section',
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub,
          anticipatePin: 1,
        }),
      })
      LANDING_SCENES.forEach((_, index) => {
        if (index === 0) {
          pin.to({}, { duration: 0.55 })
          return
        }
        pin.to(`.feat-${index - 1}`, { autoAlpha: 0, y: -40, duration: 0.4 })
        pin.fromTo(
          `.feat-${index}`,
          { autoAlpha: 0, y: 48 },
          { autoAlpha: 1, y: 0, duration: 0.45, immediateRender: false },
          '<0.06',
        )
        pin.to({}, { duration: 0.5 })
      })
      pin.fromTo(
        '.pin-fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', duration: pin.duration() },
        0,
      )

      gsap.to('.marquee-track', {
        xPercent: -22,
        ease: 'none',
        scrollTrigger: onScroller({
          trigger: '.parallax-band',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }),
      })

      const cardShift = [-48, 84, -18]
      scope.querySelectorAll<HTMLElement>('.para-card').forEach((card, index) => {
        gsap.to(card, {
          y: (cardShift[index] ?? 0) * strength,
          ease: 'none',
          scrollTrigger: onScroller({
            trigger: '.parallax-band',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }),
        })
      })

      gsap.from('.close-line', {
        yPercent: 120,
        ease: 'none',
        scrollTrigger: onScroller({
          trigger: '.close-section',
          start: 'top 80%',
          end: 'top 40%',
          scrub: true,
        }),
      })

      CustomEase.create('lumen-ease', 'M0,0 C0.18,0.86 0.22,1.12 1,1')

      gsap.set('.reel-b', { x: -90, autoAlpha: 0 })
      gsap.set('.reel-c', { scale: 0.35, autoAlpha: 0 })
      gsap.set('.reel-dot', { y: 22, autoAlpha: 0 })
      const playback: { tl?: gsap.core.Timeline } = {}
      const reel = gsap.timeline({
        paused: true,
        defaults: { duration: 0.65, ease: 'power3.out' },
        onUpdate() {
          if (playback.tl) syncReel(playback.tl)
        },
        onComplete() {
          setReelPlaying(false)
        },
        onReverseComplete() {
          setReelPlaying(false)
        },
      })
      playback.tl = reel
      showreelRef.current = reel
      reel.addLabel('to', 0)
      reel.to('.reel-a', { x: 120, rotation: 16 }, 'to')
      reel.addLabel('fromTo', '>')
      reel.fromTo(
        '.reel-b',
        { x: -90, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, immediateRender: false },
        'fromTo',
      )
      reel.fromTo(
        '.reel-c',
        { scale: 0.35, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, immediateRender: false },
        '<0.12',
      )
      reel.addLabel('stagger', '>')
      reel.to(
        '.reel-dot',
        {
          y: 0,
          autoAlpha: 1,
          stagger: { each: 0.07, from: 'center' },
          ease: 'back.out(1.7)',
        },
        'stagger',
      )
      reel.addLabel('settle', '>')
      reel.to(
        '.reel-a',
        { x: 28, rotation: 0, duration: 0.85, ease: 'elastic.out(1,0.55)' },
        'settle',
      )
      ScrollTrigger.create(
        onScroller({
          trigger: '#reel',
          start: 'top 70%',
          once: true,
          onEnter() {
            reel.play()
            setReelPlaying(true)
          },
        }),
      )

      const route = scope.querySelector('.route-draw')
      if (route instanceof SVGPathElement) {
        gsap.set(route, { drawSVG: 0 })
        gsap.to(route, {
          drawSVG: '100%',
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: onScroller({
            trigger: '#path',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }),
        })
        gsap.to('.route-bead', {
          opacity: 1,
          duration: 0.35,
          stagger: 0.12,
          scrollTrigger: onScroller({
            trigger: '#path',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }),
        })
        gsap.to('.route-bead', {
          motionPath: {
            path: route,
            align: route,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: 5.5,
          ease: 'none',
          repeat: -1,
          stagger: 0.4,
          immediateRender: false,
          scrollTrigger: onScroller({
            trigger: '#path',
            start: 'top 78%',
            toggleActions: 'play pause resume pause',
          }),
        })
      }

      gsap.from('.letter-in', {
        yPercent: 120,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power4.out',
        scrollTrigger: onScroller({
          trigger: '#text',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }),
      })
      const phrases = gsap.timeline({ repeat: -1 })
      phraseTimelineRef.current = phrases
      TEXT_PHRASES.forEach((text) => {
        phrases.to('.scramble-line', {
          duration: 0.95,
          ease: 'none',
          scrambleText: { text, chars: '01ABCDEF', speed: 0.4, revealDelay: 0.2 },
        })
        phrases.to({}, { duration: 1 })
      })

      playEasesRef.current = () => {
        scope.querySelectorAll<HTMLElement>('.ease-lane').forEach((lane) => {
          const dot = lane.querySelector<HTMLElement>('.ease-dot')
          if (!dot) return
          const distance = Math.max(0, lane.clientWidth - dot.offsetWidth - 4)
          gsap.fromTo(
            dot,
            { x: 0 },
            {
              x: distance,
              duration: 1.25,
              ease: dot.dataset.ease || 'power1.out',
              overwrite: 'auto',
            },
          )
        })
      }
      ScrollTrigger.create(
        onScroller({
          trigger: '#ease',
          start: 'top 70%',
          once: true,
          onEnter: playEasesRef.current,
        }),
      )

      ScrollTrigger.refresh()

      return () => {
        window.removeEventListener('pointermove', onPointerMove)
        magnetCleanups.forEach((cleanup) => cleanup())
      }
    }, scope)

    return () => {
      ctx.revert()
      showreelRef.current = null
      phraseTimelineRef.current = null
    }
  }, [args.strength, args.scrub])

  return (
    <div
      ref={rootRef}
      className="relative overflow-x-hidden bg-[var(--bg-color-page)] text-[var(--text-color-primary)]"
    >
      <div className="cursor-glow pointer-events-none fixed left-0 top-0 z-30 h-72 w-72 rounded-full bg-[var(--brand-color-6)] opacity-25 blur-3xl" />

      <section className="hero relative flex min-h-screen flex-col items-center justify-center gap-12 overflow-hidden px-6 py-24 md:flex-row md:px-14">
        <div className="blob-far-scroll pointer-events-none absolute -left-24 -top-28">
          <div className="blob-far h-[28rem] w-[28rem] rounded-full bg-[var(--brand-color-6)] opacity-25 blur-3xl" />
        </div>
        <div className="blob-mid-scroll pointer-events-none absolute -right-20 top-1/4">
          <div className="blob-mid h-80 w-80 rounded-full bg-[var(--warning-color-5)] opacity-25 blur-3xl" />
        </div>
        <div className="blob-near-scroll pointer-events-none absolute bottom-24 left-1/3">
          <div className="blob-near h-36 w-36 rounded-full bg-[var(--success-color-5)] opacity-40 blur-2xl" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <header className="hero-fade absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-14">
          <span className="text-sm font-semibold tracking-[0.2em]">流明</span>
          <div className="flex gap-6 text-xs text-[var(--text-color-secondary)]">
            <span>产品</span>
            <span>场景</span>
            <span>关于</span>
          </div>
        </header>

        <div className="hero-copy-scroll relative z-20 w-full max-w-xl">
          <div className="hero-copy">
            <p className="hero-fade text-xs uppercase tracking-[0.22em] text-[var(--brand-color-6)]">
              Lumen / 官网动效
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] md:text-7xl">
              <span className="block overflow-hidden">
                <span className="hero-line block">动一下鼠标</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line block">这一页就活了</span>
              </span>
            </h1>
            <p className="hero-fade mt-6 max-w-md text-sm leading-6 text-[var(--text-color-secondary)] md:text-base">
              鼠标分层、滚动钉住、时间轴、路径、文字、布局和缓动，核心能力在这一页里过完。
            </p>
            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="magnet rounded-full bg-[var(--brand-color-6)] px-6 py-3 text-sm text-[var(--text-color-anti)]"
                onClick={scrollToPin}
              >
                继续下滚
              </button>
            </div>
            <div className="hero-fade mt-5 flex flex-wrap gap-2">
              {LANDING_CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className="rounded-full bg-[var(--bg-color-container)] px-3 py-1.5 text-xs text-[var(--text-color-secondary)]"
                  onClick={() => go(chapter.id)}
                >
                  {chapter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="device-wrap relative z-20 w-full max-w-sm" style={{ perspective: 1000 }}>
          <div className="device-float">
            <div className="device-tilt" style={{ transformStyle: 'preserve-3d' }}>
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-color-container)] p-3">
                <div className="device-inner rounded-2xl bg-[var(--bg-color-page)] p-5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--error-color-5)]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--warning-color-5)]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--success-color-5)]" />
                  </div>
                  <p className="mt-8 text-xs text-[var(--text-color-secondary)]">实时预览</p>
                  <p className="mt-1 text-4xl font-semibold">128%</p>
                  <div className="mt-8 flex h-28 items-end gap-2">
                    <div className="h-[36%] flex-1 rounded-md bg-[var(--brand-color-4)]" />
                    <div className="h-[62%] flex-1 rounded-md bg-[var(--brand-color-5)]" />
                    <div className="h-full flex-1 rounded-md bg-[var(--brand-color-6)]" />
                    <div className="h-[48%] flex-1 rounded-md bg-[var(--brand-color-5)]" />
                    <div className="h-[78%] flex-1 rounded-md bg-[var(--success-color-5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-fade absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-center text-xs text-[var(--text-color-secondary)]">
          <div className="scroll-cue">向下滚动</div>
        </div>
      </section>

      <section
        id="pin"
        className="pin-section relative h-screen overflow-hidden bg-[var(--bg-color-container)]"
      >
        <div className="absolute left-6 top-1/2 h-48 w-1 -translate-y-1/2 rounded-full bg-[var(--border-color)] md:left-12">
          <div className="pin-fill h-full w-full origin-top rounded-full bg-[var(--brand-color-6)]" />
        </div>
        <div className="relative h-full">
          {LANDING_SCENES.map((scene, index) => (
            <article
              key={scene.index}
              className={`feat feat-${index} absolute inset-0 flex items-center px-16 md:px-28`}
            >
              <div className="max-w-3xl">
                <div className="text-sm text-[var(--brand-color-6)]">{scene.index}</div>
                <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
                  {scene.title}
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-color-secondary)]">
                  {scene.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="parallax-band relative overflow-hidden py-28">
        <div className="overflow-hidden">
          <div className="marquee-track whitespace-nowrap px-6 text-[16vw] font-semibold leading-none text-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]">
            视差 · 跟随 · 钉住 · 分层 · 视差 · 跟随 · 钉住 · 分层
          </div>
        </div>
        <div className="mt-16 flex flex-col items-stretch gap-4 px-6 md:flex-row md:px-14">
          {LANDING_CARDS.map((card) => (
            <article
              key={card.kicker}
              className={`para-card w-full flex-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color-container)] p-6 ${card.shift}`}
            >
              <div className="text-xs text-[var(--brand-color-6)]">{card.kicker}</div>
              <h3 className="mt-3 text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-color-secondary)]">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="reel" className="bg-[var(--bg-color-container)] px-6 py-24 md:px-14">
        <p className="text-xs tracking-[0.18em] text-[var(--brand-color-6)]">TIMELINE</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-semibold md:text-4xl">一条时间轴排完</h2>
          <span className="text-sm text-[var(--text-color-secondary)]">
            {reelLabel} · {reelPercent}%
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs ${
              reelPlaying
                ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                : 'bg-[var(--bg-color-page)]'
            }`}
            onClick={toggleReel}
          >
            {reelPlaying ? '暂停' : '播放'}
          </button>
          <button
            type="button"
            className="rounded-md bg-[var(--bg-color-page)] px-3 py-1.5 text-xs"
            onClick={reverseReel}
          >
            倒放
          </button>
          <button
            type="button"
            className="rounded-md bg-[var(--bg-color-page)] px-3 py-1.5 text-xs"
            onClick={restartReel}
          >
            重来
          </button>
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              className={`rounded-md px-2.5 py-1.5 text-xs tabular-nums ${
                reelSpeed === rate
                  ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                  : 'bg-[var(--bg-color-page)]'
              }`}
              onClick={() => setReelSpeedRate(rate)}
            >
              {rate}x
            </button>
          ))}
        </div>
        <input
          className="mt-4 w-full"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={reelProgress}
          aria-label="时间轴进度"
          onChange={scrubReel}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {REEL_MARKS.map((mark) => (
            <button
              key={mark.id}
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${
                reelLabel === mark.name
                  ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                  : 'bg-[var(--bg-color-page)] text-[var(--text-color-secondary)]'
              }`}
              onClick={() => seekReel(mark.id)}
            >
              {mark.name}
            </button>
          ))}
        </div>
        <div className="mt-8 flex h-36 items-center gap-4 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color-page)] px-6">
          <div className="reel-a h-14 w-14 shrink-0 rounded-2xl bg-[var(--brand-color-6)]" />
          <div className="reel-b h-14 w-14 shrink-0 rounded-2xl bg-[var(--warning-color-5)] opacity-0" />
          <div className="reel-c h-14 w-14 shrink-0 rounded-2xl bg-[var(--success-color-5)] opacity-0" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className="reel-dot h-3 w-3 rounded-full bg-[var(--brand-color-6)] opacity-0"
              />
            ))}
          </div>
        </div>
      </section>

      <section id="path" className="px-6 py-24 md:px-14">
        <p className="text-xs tracking-[0.18em] text-[var(--brand-color-6)]">
          DRAWSVG · MOTIONPATH
        </p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">线先画出来，点再沿着走</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-color-secondary)]">
          滚到这里，描边补完，四颗珠子错开并一直循环。离开视口会暂停。
        </p>
        <svg className="mt-8 h-56 w-full" viewBox="0 0 800 220" preserveAspectRatio="none">
          <path d={ROUTE_PATH} fill="none" stroke="var(--border-color)" strokeWidth="1.5" />
          <path
            className="route-draw"
            d={ROUTE_PATH}
            fill="none"
            stroke="var(--brand-color-6)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {ROUTE_BEADS.map((color, index) => (
            <rect
              key={`bead-${index}`}
              className="route-bead"
              width={16}
              height={8}
              rx={4}
              fill={color}
              opacity={0}
            />
          ))}
        </svg>
      </section>

      <section id="text" className="bg-[var(--bg-color-container)] px-6 py-24 md:px-14">
        <p className="text-xs tracking-[0.18em] text-[var(--brand-color-6)]">
          STAGGER · SCRAMBLETEXT
        </p>
        <h2 className="mt-3 flex flex-wrap text-4xl font-semibold md:text-6xl">
          {[...'核心能力'].map((char, index) => (
            <span key={`c-${index}`} className="inline-block overflow-hidden">
              <span className="letter-in inline-block">{char}</span>
            </span>
          ))}
        </h2>
        <p className="scramble-line mt-8 min-h-10 font-mono text-2xl md:text-3xl">
          把补间排成一句
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-[var(--brand-color-6)] px-5 py-2.5 text-sm text-[var(--text-color-anti)]"
          onClick={nextPhrase}
        >
          换一句
        </button>
      </section>

      <section id="flip" className="px-6 py-24 md:px-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[var(--brand-color-6)]">FLIP</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">布局变了，位置补过去</h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-[var(--border-color)] bg-[var(--bg-color-container)] px-5 py-2.5 text-sm"
            onClick={toggleFlip}
          >
            {flipStacked ? '铺回两列' : '叠成一列'}
          </button>
        </div>
        <div
          className={`flip-board relative mt-8 flex flex-wrap gap-3 ${
            flipStacked ? 'flex-col' : 'flex-row'
          }`}
        >
          {flipItems.map((item, index) => (
            <article
              key={item.id}
              data-flip-id={item.id}
              className={`flip-item rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color-container)] p-5 ${
                flipStacked
                  ? index === 0
                    ? 'min-h-40 w-full'
                    : 'min-h-24 w-full'
                  : 'min-h-36 w-full md:w-[calc(50%-0.375rem)]'
              }`}
            >
              <div className="text-xs text-[var(--brand-color-6)]">0{index + 1}</div>
              <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-color-secondary)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ease" className="bg-[var(--bg-color-container)] px-6 py-24 md:px-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[var(--brand-color-6)]">EASE</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">同一段路，四种走法</h2>
          </div>
          <button
            type="button"
            className="rounded-full bg-[var(--brand-color-6)] px-5 py-2.5 text-sm text-[var(--text-color-anti)]"
            onClick={() => playEasesRef.current()}
          >
            再走一次
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {EASE_ROWS.map((row) => (
            <div key={row.ease} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-xs text-[var(--text-color-secondary)]">
                {row.label}
              </span>
              <div className="ease-lane relative h-8 flex-1 overflow-hidden rounded-full bg-[var(--bg-color-page)]">
                <span
                  className="ease-dot absolute left-1 top-1 h-6 w-6 rounded-full bg-[var(--brand-color-6)]"
                  data-ease={row.ease}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="close-section flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="overflow-hidden">
          <h2 className="close-line text-4xl font-semibold leading-tight md:text-6xl">
            停在你刚看过的地方
          </h2>
        </div>
        <button
          type="button"
          className="magnet mt-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-color-container)] px-6 py-3 text-sm"
          onClick={replay}
        >
          回到顶部
        </button>
      </section>
    </div>
  )
}

export const Landing: StoryObj<LandingArgs> = {
  name: '核心能力',
  args: {
    strength: 1,
    scrub: 0.7,
  },
  argTypes: {
    strength: {
      control: { type: 'number', min: 0.2, max: 2, step: 0.1 },
      description: '鼠标与滚动视差的幅度',
    },
    scrub: {
      control: { type: 'number', min: 0, max: 2, step: 0.1 },
      description: '滚动钉住段的平滑时间（秒），0 为即时跟随',
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '同一页演示 GSAP 核心：鼠标 quickTo 与吸附、ScrollTrigger 钉住和视差、可倒放的时间轴（to / fromTo / stagger）、DrawSVG + MotionPath、ScrambleText、Flip 换布局，以及四种缓动对比。',
      },
    },
  },
  render: (args) => <LandingDemo args={args} />,
}

