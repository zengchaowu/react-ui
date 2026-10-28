import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, UIEvent as ReactUIEvent } from 'react'
import CwDiv from '../CwDiv'
import type { CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import { CwLoading } from '../CwLoading'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { pptEditorBase } from '@zengchaowu/ui-shared/components/CwPptEditor/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwPptEditor/texts'
import type { CwPptEditorHandle, CwPptEditorProps } from './types'
import type { CwPptBorderSide, CwPptBox, CwPptDeck, CwPptEmbeddedFont, CwPptImage, CwPptLine, CwPptSlide, CwPptTextParagraph, CwPptTextRun } from '@zengchaowu/ui-shared/components/CwPptEditor/types'
import { polygonClipPathFromPoints100, roundRectRadiusPercent } from '@zengchaowu/ui-shared/components/CwPptEditor/functions/presetGeometry'
import {
  blankSlide,
  cloneDeck,
  createBlankDeck,
  createId,
  deckToArrayBuffer,
  parsePptx,
  readPptSource,
  sameDeck,
} from '@zengchaowu/ui-shared/components/CwPptEditor/functions/pptx'
// Worker 必须内联进产物：lib 模式下 new URL('./x.ts', import.meta.url) 会内联成无法执行的原始源码，
// 而独立 worker 资源在消费方应用里的 /assets/* 绝对路径会 404。inline 在构建时把打包结果做成 blob，产物自包含
import FontDecompressWorker from '@zengchaowu/ui-shared/components/CwPptEditor/functions/fontDecompress.worker?worker&inline'

const SLIDE_GAP = 12
const PPT_FONT_FALLBACK = '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'

type SlidePaintLayer =
  | { kind: 'image'; id: string; z: number; image: CwPptImage }
  | { kind: 'box'; id: string; z: number; box: CwPptBox }
  | { kind: 'line'; id: string; z: number; line: CwPptLine }

export const CwPptEditor = forwardRef<CwPptEditorHandle, CwPptEditorProps>(
  function CwPptEditor(
    {
      modelValue,
      src = null,
      mode = 'edit',
      readonly = false,
      texts: textsProp,
      className,
      onModelValueChange,
      onChange,
      ...rest
    },
    ref,
  ) {
    const texts = { ...defaultTexts, ...(textsProp ?? {}) }
    const previewing = mode === 'preview' || readonly

    const [deck, setDeck] = useState<CwPptDeck>(() =>
      modelValue ? cloneDeck(modelValue) : createBlankDeck(),
    )
    const [loading, setLoading] = useState(src != null && modelValue == null)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState(0)
    const [selectedBox, setSelectedBox] = useState('')
    const [stageWidth, setStageWidth] = useState(960)
    const stageRef = useRef<CwDivHandle | null>(null)

    // 文本框拖拽/输入走原地变更（与 Vue 的响应式变更一致），用 ref 保证始终拿到最新 deck
    const deckRef = useRef(deck)
    useEffect(() => {
      deckRef.current = deck
    }, [deck])

    const textsRef = useRef(texts)
    useEffect(() => {
      textsRef.current = texts
    })

    const [viewportTop, setViewportTop] = useState(0)
    const [viewportHeight, setViewportHeight] = useState(0)

    const slideLabel = (() => {
      const total = deck.slides.length
      const index = total ? Math.min(selected, total - 1) + 1 : 0
      return texts.slideText.replace('{current}', String(index)).replace('{total}', String(total))
    })()

    const slideWidth = Math.max(160, stageWidth - 32)
    const slideHeight = slideWidth / (deck.width / Math.max(deck.height, 1))

    function layoutsFor(target: CwPptDeck) {
      let top = 0
      const height = slideHeight
      return target.slides.map((_, index) => {
        const slot = { index, top, height }
        top += height + SLIDE_GAP
        return slot
      })
    }

    const layouts = useMemo(() => layoutsFor(deck), [deck, slideHeight])

    const totalHeight = (() => {
      const last = layouts[layouts.length - 1]
      return last ? last.top + last.height : 0
    })()

    /**
     * 只渲染视口附近的幻灯片：22 页一次性挂载会让首屏同时解码十几 MB 的图片并布局全部内容。
     * 幻灯片用绝对定位按 top 摆放，因此隐藏未进入视口的页不会影响滚动几何。
     * 向外多留一页高度作为缓冲，避免快速滚动时出现空白。选中页始终保留（可能被程序化滚动到）。
     */
    const visibleSlots = (() => {
      const buffer = slideHeight
      const top = viewportTop - buffer
      const bottom = viewportTop + (viewportHeight || slideHeight) + buffer
      return layouts.filter((slot) => {
        if (slot.index === selected) return true
        return slot.top + slot.height > top && slot.top < bottom
      })
    })()

    function stageViewport() {
      return resolveCwDivViewport(stageRef.current)
    }

    function syncViewport() {
      const stage = stageViewport()
      if (!stage) return
      setViewportTop(stage.scrollTop)
      setViewportHeight(stage.clientHeight)
    }

    function slidePaintLayers(slide?: CwPptSlide): SlidePaintLayer[] {
      if (!slide) return []
      const layers: SlidePaintLayer[] = []
      for (const image of slide.images) {
        layers.push({ kind: 'image', id: image.id, z: image.z ?? 0, image })
      }
      for (const box of slide.boxes) {
        layers.push({ kind: 'box', id: box.id, z: box.z ?? 0, box })
      }
      for (const line of slide.lines ?? []) {
        layers.push({ kind: 'line', id: line.id, z: line.z ?? 0, line })
      }
      layers.sort((a, b) => a.z - b.z)
      return layers
    }

    function isFullBleedImage(image: CwPptImage) {
      return image.x <= 0.02 && image.y <= 0.02 && image.w >= 0.96 && image.h >= 0.96
    }

    function imageClass(image: CwPptImage) {
      if (isFullBleedImage(image)) return pptEditorBase.imageCover
      if (image.crop) return pptEditorBase.imageCrop
      return pptEditorBase.image
    }

    function imageFrameStyle(image: CwPptImage): CSSProperties {
      const base = frameStyle(image)
      const crop = image.crop
      if (!crop) return base
      return {
        ...base,
        objectFit: 'fill' as const,
        clipPath: `inset(${crop.top * 100}% ${crop.right * 100}% ${crop.bottom * 100}% ${crop.left * 100}%)`,
      }
    }

    function linePolylineAttr(line: CwPptLine) {
      if (!line.polyline?.length) return ''
      return line.polyline.map((point) => `${point.x},${point.y}`).join(' ')
    }

    function lineDiagonalPoint(line: CwPptLine) {
      let x1 = 0
      let y1 = 0
      let x2 = 100
      let y2 = 100
      if (line.flipH) {
        x1 = 100 - x1
        x2 = 100 - x2
      }
      if (line.flipV) {
        y1 = 100 - y1
        y2 = 100 - y2
      }
      return { x1, y1, x2, y2 }
    }

    function effectiveLineRot(line: CwPptLine) {
      const rot = line.rot ?? 0
      return Math.abs(rot) < 0.5 ? 0 : rot
    }

    function linePoint(line: CwPptLine) {
      if (effectiveLineRot(line)) return lineDiagonalPoint(line)
      const w = Math.abs(line.w)
      const h = Math.abs(line.h)
      if (w > 0 && h > 0) {
        const ratio = Math.max(w, h) / Math.min(w, h)
        if (ratio >= 4) {
          if (w < h) {
            let x1 = 50
            let y1 = 0
            let x2 = 50
            let y2 = 100
            if (line.flipV) {
              y1 = 100 - y1
              y2 = 100 - y2
            }
            return { x1, y1, x2, y2 }
          }
          let x1 = 0
          let y1 = 50
          let x2 = 100
          let y2 = 50
          if (line.flipH) {
            x1 = 100 - x1
            x2 = 100 - x2
          }
          return { x1, y1, x2, y2 }
        }
      }
      return lineDiagonalPoint(line)
    }

    function lineFrameStyle(line: CwPptLine): CSSProperties {
      const style = frameStyle(line)
      const rot = effectiveLineRot(line)
      if (!rot) return style
      return {
        ...style,
        transform: `rotate(${rot}deg)`,
        transformOrigin: 'center center',
      }
    }

    function lineWidthPx(line: CwPptLine) {
      const scale = slideHeight / Math.max(deck.height, 1)
      return Math.max(1, (line.widthPt || 1) * scale)
    }

    function frameStyle(frame: { x: number; y: number; w: number; h: number; z?: number }): CSSProperties {
      return {
        left: `${frame.x * 100}%`,
        top: `${frame.y * 100}%`,
        width: `${frame.w * 100}%`,
        height: `${frame.h * 100}%`,
        zIndex: frame.z ?? 0, // design-token-check: ignore — 叠放层级来自文档元素顺序
      }
    }

    function pptHexChannels(hex: string) {
      const value = hex.replace('#', '').padStart(6, '0').slice(0, 6)
      return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
    }

    function fillCssColor(fill: string, opacity?: number) {
      const o = opacity ?? 1
      if (o >= 0.999) return fill
      const [r, g, b] = pptHexChannels(fill)
      return `rgba(${r},${g},${b},${o})` // design-token-check: ignore — 文档色 + 透明度动态合成，CSS var 无法表达
    }

    function strokeCssColor(color: string, opacity?: number) {
      const o = opacity ?? 1
      if (o >= 0.999) return color
      const [r, g, b] = pptHexChannels(color)
      return `rgba(${r},${g},${b},${o})` // design-token-check: ignore — 文档色 + 透明度动态合成，CSS var 无法表达
    }

    function borderWidthPx(box: CwPptBox) {
      const scale = slideHeight / Math.max(deck.height, 1)
      return Math.max(1, (box.borderWidthPt || 1) * scale)
    }

    function cellSideBorderCss(side: CwPptBorderSide | undefined, scale: number) {
      if (!side) return undefined
      const w = Math.max(0.5, side.widthPt * scale)
      const dash = side.dash && side.dash !== 'solid' ? side.dash : 'solid'
      const color =
        side.opacity !== undefined && side.opacity < 0.999
          ? strokeCssColor(side.color, side.opacity)
          : side.color
      return `${w}px ${dash} ${color}`
    }

    function boxPolygonFill(box: CwPptBox) {
      if (!box.fill) return 'transparent'
      return fillCssColor(box.fill, box.fillOpacity)
    }

    function boxSvgStrokeWidth(box: CwPptBox) {
      const boxWpx = box.w * slideWidth
      const boxHpx = box.h * slideHeight
      const minPx = Math.max(1, Math.min(boxWpx, boxHpx))
      return (borderWidthPx(box) / minPx) * 100
    }

    function boxSvgStrokeDash(box: CwPptBox) {
      if (!box.borderDash || box.borderDash === 'solid') return undefined
      if (box.borderDash === 'dotted') return '2 4'
      return '6 4'
    }

    function boxTextClipStyle(box: CwPptBox): CSSProperties {
      if (!box.polygonPoints) return {}
      return { clipPath: polygonClipPathFromPoints100(box.polygonPoints) }
    }

    function boxTextSurfaceStyle(box: CwPptBox, _slide?: CwPptSlide): CSSProperties {
      return { ...textStyle(box), ...boxTextClipStyle(box) }
    }

    function boxFrameStyle(box: CwPptBox, _slide?: CwPptSlide): CSSProperties {
      const layout = frameStyle(box)
      const style: CSSProperties = { ...layout }
      const rot = box.rot ?? 0
      if (Math.abs(rot) >= 0.5) {
        style.transform = `rotate(${rot}deg)`
        style.transformOrigin = 'center center'
      }
      if (box.polygonPoints) {
        style.backgroundColor = 'transparent'
      }
      if (box.geomPreset === 'ellipse') style.borderRadius = '50%'
      if (box.geomPreset === 'roundRect') {
        const shortPx = Math.min(box.w * slideWidth, box.h * slideHeight)
        const frac = (box.roundRectRadius ?? roundRectRadiusPercent()) / 100
        style.borderRadius = `${frac * shortPx}px`
      }
      if (box.fill && !box.polygonPoints) {
        style.backgroundColor = fillCssColor(box.fill, box.fillOpacity)
      }
      if (box.borders) {
        const scale = slideHeight / Math.max(deck.height, 1)
        style.boxSizing = 'border-box'
        if (!style.backgroundColor) style.backgroundColor = 'transparent'
        const top = cellSideBorderCss(box.borders.top, scale)
        const right = cellSideBorderCss(box.borders.right, scale)
        const bottom = cellSideBorderCss(box.borders.bottom, scale)
        const left = cellSideBorderCss(box.borders.left, scale)
        if (top) style.borderTop = top
        if (right) style.borderRight = right
        if (bottom) style.borderBottom = bottom
        if (left) style.borderLeft = left
      } else if (box.borderColor && !box.polygonPoints) {
        const w = borderWidthPx(box)
        const dash = box.borderDash && box.borderDash !== 'solid' ? box.borderDash : 'solid'
        style.boxSizing = 'border-box'
        style.backgroundColor = style.backgroundColor || 'transparent'
        style.border = `${w}px ${dash} ${strokeCssColor(box.borderColor, box.borderOpacity)}`
      }
      return style
    }

    function slideHasFullBleedBackground(slide: CwPptSlide | undefined) {
      return slide?.images.some((image) => isFullBleedImage(image)) ?? false
    }

    function slideStyle(index: number): CSSProperties {
      const slot = layouts[index]
      const slide = deck.slides[index]
      const coverBg = slideHasFullBleedBackground(slide)
      return {
        top: `${slot?.top ?? 0}px`,
        height: `${slot?.height ?? 0}px`,
        backgroundColor: coverBg ? 'transparent' : slide?.background || tokenSolidColors.white,
      }
    }

    /** 字号磅值 → 预览像素（与幻灯片 slideCy 对应的真实高度磅值对齐） */
    function fontPx(box: CwPptBox) {
      return fontPxFromPt(box.fontSize)
    }

    function estimateNormAutofitPx(box: CwPptBox, basePx: number) {
      const pad = box.padding
      const innerW = Math.max(
        12,
        box.w * slideWidth - ((pad?.left ?? 0) + (pad?.right ?? 0)) * slideWidth,
      )
      const innerH = Math.max(
        12,
        box.h * slideHeight - ((pad?.top ?? 0) + (pad?.bottom ?? 0)) * slideHeight,
      )
      let px = basePx
      const lines = (box.text || '').split('\n')
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const totalLines = lines.reduce((sum, line) => {
          const charWidth = px * 0.52
          const lineWidth = Math.max(1, line.length) * charWidth
          return sum + Math.max(1, Math.ceil(lineWidth / innerW))
        }, 0)
        if (totalLines * px * 1.12 <= innerH) return px
        px *= 0.9
      }
      return Math.max(6, px)
    }

    function displayFontPx(box: CwPptBox, fontSizePt?: number) {
      const base = fontPxFromPt(fontSizePt ?? box.fontSize)
      const multiPara = (box.paragraphs?.length ?? 0) > 1
      if (box.textFit === 'norm' && box.text?.trim() && !multiPara) return estimateNormAutofitPx(box, base)
      return base
    }

    function fontPxFromPt(fontSizePt: number) {
      const slidePt = Math.max(deck.height, 1)
      return Math.max(1, fontSizePt * (slideHeight / slidePt))
    }

    function textPaddingStyle(box: CwPptBox): CSSProperties {
      const pad = box.padding
      if (!pad) return {}
      return {
        boxSizing: 'border-box' as const,
        paddingTop: `${pad.top * slideHeight}px`,
        paddingRight: `${pad.right * slideWidth}px`,
        paddingBottom: `${pad.bottom * slideHeight}px`,
        paddingLeft: `${pad.left * slideWidth}px`,
      }
    }

    function boxTextLayoutStyle(box: CwPptBox, _slide?: CwPptSlide): CSSProperties {
      const justify =
        box.vAnchor === 'center' ? 'center' : box.vAnchor === 'bottom' ? 'flex-end' : 'flex-start'
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: justify,
        ...textPaddingStyle(box),
        ...boxTextClipStyle(box),
      }
    }

    function textFontFamily(value?: string): CSSProperties {
      return { fontFamily: value || PPT_FONT_FALLBACK }
    }

    function fontWeightStyle(bold?: boolean): CSSProperties {
      return bold ? { fontWeight: 700 as const } : {}
    }

    function paragraphBlockStyle(box: CwPptBox, para: CwPptTextParagraph): CSSProperties {
      return {
        fontSize: `${displayFontPx(box, para.fontSize)}px`,
        lineHeight: para.lineHeight ?? 1.1,
        color: para.color || box.color || tokenSolidColors.docInk,
        textAlign: para.align || box.align || 'left',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        ...textFontFamily(para.fontFamily || box.fontFamily),
        ...fontWeightStyle(para.bold && !para.runs?.length),
      }
    }

    function runTextStyle(box: CwPptBox, run: CwPptTextRun): CSSProperties {
      return {
        fontSize: `${displayFontPx(box, run.fontSize)}px`,
        color: run.color,
        ...textFontFamily(run.fontFamily || box.fontFamily),
        ...fontWeightStyle(run.bold),
      }
    }

    function textStyle(box: CwPptBox): CSSProperties {
      return {
        fontSize: `${displayFontPx(box)}px`,
        lineHeight: 1.12,
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        color: box.color || tokenSolidColors.docInk,
        textAlign: box.align || 'left',
        ...textFontFamily(box.fontFamily),
        ...fontWeightStyle(box.bold),
        ...textPaddingStyle(box),
      }
    }

    /** 原地变更后触发重渲染（拖拽文字框等场景，与 Vue 响应式重渲染对应） */
    function rerender() {
      setDeck({ ...deckRef.current })
    }

    function publish() {
      const next = cloneDeck(deckRef.current)
      onModelValueChange?.(next)
      onChange?.(next)
    }

    function patch(change: (deck: CwPptDeck) => void) {
      const next = cloneDeck(deckRef.current)
      change(next)
      deckRef.current = next
      setDeck(next)
      setSelected((prev) => Math.min(prev, Math.max(next.slides.length - 1, 0)))
      publish()
      return next
    }

    function addText() {
      patch((next) => {
        const slide = next.slides[Math.min(selected, Math.max(next.slides.length - 1, 0))]
        if (!slide) return
        const box: CwPptBox = {
          id: createId('box'),
          x: 0.12,
          y: Math.min(0.7, 0.12 + slide.boxes.length * 0.06),
          w: 0.4,
          h: 0.12,
          text: '',
          fontSize: 18,
          color: tokenSolidColors.docInk,
          fill: '',
          align: 'left',
          z: slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0),
        }
        slide.boxes.push(box)
        setSelectedBox(box.id)
      })
    }

    function addSlide() {
      const nextSelected = Math.min(selected + 1, deckRef.current.slides.length)
      const next = patch((target) => {
        target.slides.splice(nextSelected, 0, blankSlide(target.slides.length + 1))
      })
      setSelected(nextSelected)
      setSelectedBox('')
      scrollSelectedIntoView(next, nextSelected)
    }

    function deleteSlide() {
      if (deckRef.current.slides.length < 2) return
      const nextSelected = Math.max(0, Math.min(selected, deckRef.current.slides.length - 2))
      const next = patch((target) => {
        target.slides.splice(selected, 1)
      })
      setSelected(nextSelected)
      setSelectedBox('')
      scrollSelectedIntoView(next, nextSelected)
    }

    function scrollSelectedIntoView(deckForLayout: CwPptDeck, index: number) {
      // nextTick → rAF：等幻灯片栈按新 deck 渲染完成再滚动
      requestAnimationFrame(() => {
        const stage = stageViewport()
        const slot = layoutsFor(deckForLayout)[index]
        if (!stage || !slot) return
        const viewTop = stage.scrollTop
        const viewBottom = viewTop + stage.clientHeight
        if (slot.top >= viewTop && slot.top + slot.height <= viewBottom) return
        stage.scrollTo({ top: Math.max(0, slot.top - 16) })
      })
    }

    function onScroll(event?: ReactUIEvent<HTMLDivElement>) {
      const stage = event?.currentTarget instanceof HTMLElement ? event.currentTarget : stageViewport()
      if (!stage) return
      setViewportTop(stage.scrollTop)
      setViewportHeight(stage.clientHeight)
      const mark = stage.scrollTop + Math.min(48, stage.clientHeight / 3)
      let next = 0
      for (const slot of layouts) {
        if (slot.top <= mark) next = slot.index
      }
      if (next !== selected) setSelected(next)
    }

    function onBoxInput(box: CwPptBox, value: string) {
      if (box.text === value) return
      box.text = value
      publish()
    }

    function onBoxPointerDown(slideIndex: number, box: CwPptBox, event: ReactPointerEvent<HTMLDivElement>) {
      setSelected(slideIndex)
      if (!box.text && box.fill) return
      setSelectedBox(box.id)
      if (previewing) return
      if ((event.target as HTMLElement).tagName === 'TEXTAREA') return
      const slide = (event.currentTarget as HTMLElement).parentElement
      if (!slide) return
      const rect = slide.getBoundingClientRect()
      const origin = { x: box.x, y: box.y, clientX: event.clientX, clientY: event.clientY }
      const move = (ev: PointerEvent) => {
        box.x = Math.min(1 - box.w, Math.max(0, origin.x + (ev.clientX - origin.clientX) / rect.width))
        box.y = Math.min(1 - box.h, Math.max(0, origin.y + (ev.clientY - origin.clientY) / rect.height))
        rerender()
      }
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        publish()
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    }

    /** 已注册的内嵌字体（family|weight|style），避免重复 FontFace 加载 */
    const registeredFonts = useRef(new Set<string>())

    /** 字体解压 Worker：创建一次复用；创建或加载失败则整体降级到主线程 */
    const fontWorkerRef = useRef<Worker | null>(null)
    const fontWorkerBrokenRef = useRef(false)
    const fontTaskSeqRef = useRef(0)
    const fontTasksRef = useRef(
      new Map<number, { resolve: (ttf: Uint8Array) => void; reject: (error: Error) => void }>(),
    )

    function failFontTasks(error: Error) {
      for (const task of fontTasksRef.current.values()) task.reject(error)
      fontTasksRef.current.clear()
    }

    function getFontWorker() {
      if (fontWorkerBrokenRef.current || typeof Worker === 'undefined') return null
      if (fontWorkerRef.current) return fontWorkerRef.current
      try {
        const worker = new FontDecompressWorker()
        worker.onmessage = (event: MessageEvent<{ id: number; ttf?: Uint8Array; message?: string }>) => {
          const task = fontTasksRef.current.get(event.data.id)
          if (!task) return
          fontTasksRef.current.delete(event.data.id)
          if (event.data.ttf) task.resolve(event.data.ttf)
          else task.reject(new Error(event.data.message || '字体解压失败'))
        }
        // Worker 脚本加载失败：中断在途任务并整体降级，避免每个字体都要卡在主线程解压一次
        worker.onerror = () => {
          failFontTasks(new Error('字体解压 Worker 加载失败'))
          worker.terminate()
          fontWorkerRef.current = null
          fontWorkerBrokenRef.current = true
        }
        fontWorkerRef.current = worker
        return worker
      } catch (err) {
        console.warn('[CwPptEditor] 无法创建字体解压 Worker，将退回主线程', err)
        fontWorkerBrokenRef.current = true
        return null
      }
    }

    /** EOT → TTF。解压是纯同步循环（单字体可达数秒），一律丢给 Worker，主线程只等结果 */
    async function decompressFont(bytes: Uint8Array): Promise<Uint8Array> {
      const worker = getFontWorker()
      if (!worker) {
        // 只有 Worker 不可用的宿主才降级到主线程，优先保证字体能用
        const { eotToTtf } = await import('mtx-decompressor')
        return eotToTtf(bytes)
      }
      return new Promise<Uint8Array>((resolve, reject) => {
        const id = ++fontTaskSeqRef.current
        fontTasksRef.current.set(id, { resolve, reject })
        worker.postMessage({ id, bytes })
      })
    }

    /** 注册单个内嵌字体：Worker 解压 → Blob URL → FontFace，顺带省掉十几 MB 的 base64 编解码 */
    async function registerFont(font: CwPptEmbeddedFont, key: string, weight: string, style: string) {
      const started = performance.now()
      try {
        const ttf = await decompressFont(font.bytes)
        // ttf 由 Worker 转移而来，底层一定是独占 ArrayBuffer（TS 的类型无法表达这一点，显式收窄）
        const url = URL.createObjectURL(new Blob([ttf as BlobPart], { type: 'font/ttf' }))
        try {
          const face = new FontFace(font.family, `url(${url})`, { weight, style })
          document.fonts.add(await face.load())
          const cost = Math.round(performance.now() - started)
          console.log(`[CwPptEditor] 内嵌字体注册成功 ${key}，TTF ${ttf.length} bytes，耗时 ${cost}ms，status=${face.status}`)
        } finally {
          URL.revokeObjectURL(url)
        }
      } catch (err) {
        // 注册失败时清掉标记，后续仍可重试，并回退到系统字体
        registeredFonts.current.delete(key)
        console.warn(`[CwPptEditor] 内嵌字体 ${key} 注册失败，已回退系统字体`, err)
      }
    }

    async function registerDeckFonts(fonts?: CwPptEmbeddedFont[]) {
      if (!fonts?.length) {
        console.log('[CwPptEditor] 无可注册的内嵌字体，文字将使用系统字体回退')
        return
      }
      if (typeof FontFace === 'undefined') {
        console.warn('[CwPptEditor] 当前环境不支持 FontFace，内嵌字体无法注册')
        return
      }
      const pending: Promise<void>[] = []
      for (const font of fonts) {
        const weight = font.weight ?? '400'
        const style = font.style ?? 'normal'
        const key = `${font.family}|${weight}|${style}`
        if (registeredFonts.current.has(key)) {
          console.log(`[CwPptEditor] 内嵌字体 ${key} 已注册过，跳过`)
          continue
        }
        registeredFonts.current.add(key)
        pending.push(registerFont(font, key, weight, style))
      }
      await Promise.all(pending)
      const families = [...document.fonts].map((item) => `${item.family}|${item.weight}|${item.style}|${item.status}`)
      console.log(`[CwPptEditor] document.fonts.size=${document.fonts.size}\n  ${families.join('\n  ')}`)
    }

    /** 诊断日志：渲染后实测文字元素真正拿到的 font-family，判断字体栈是否生效 */
    function logRenderedFonts() {
      // 段落类的类名含 Tailwind 任意值（如 [font-synthesis:weight]），无法用于拼接 CSS 选择器，这里用标签选择器
      const probe = stageViewport()?.querySelector('p')
      if (!probe) {
        console.log('[CwPptEditor] 当前页没有可探测的文字元素')
        return
      }
      try {
        const computed = getComputedStyle(probe)
        const family = deckRef.current.fonts?.[0]?.family
        // font 简写要求「字重在前、字号在后」，顺序写错会让 check() 直接抛 SyntaxError
        const available = family
          ? document.fonts.check(`${computed.fontWeight} ${computed.fontSize} "${family}"`)
          : 'n/a'
        console.log(
          `[CwPptEditor] 渲染实测：computed font-family = ${computed.fontFamily}\n` +
            `  document.fonts.check(${computed.fontWeight} ${computed.fontSize} "${family ?? ''}") = ${available}`,
        )
      } catch (err) {
        console.warn('[CwPptEditor] 渲染实测日志失败', err)
      }
    }

    const pendingPostLoadRef = useRef<{ started: number; fontReady: Promise<void> | null } | null>(null)

    async function loadSource(source: NonNullable<CwPptEditorProps['src']>) {
      const started = performance.now()
      setLoading(true)
      setError('')
      let fontReady: Promise<void> | null = null
      try {
        const buffer = await readPptSource(source)
        const parsed = await parsePptx(buffer)
        deckRef.current = parsed
        setDeck(parsed)
        setSelected(0)
        setSelectedBox('')
        // 字体解压跑在 Worker 里，这里不等它：先把幻灯片渲染出来，字体就绪后浏览器会自动重绘
        fontReady = registerDeckFonts(parsed.fonts)
      } catch (err) {
        console.warn('[CwPptEditor] 解析 pptx 失败', err)
        setError(textsRef.current.loadError)
        const blank = createBlankDeck()
        const empty: CwPptDeck = { ...blank, slides: [] }
        deckRef.current = empty
        setDeck(empty)
      } finally {
        setLoading(false)
      }
      pendingPostLoadRef.current = { started, fontReady }
    }

    useEffect(() => {
      if (src == null) return
      void loadSource(src)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    // 幻灯片栈在 loading 结束后才渲染，需等到 DOM 更新后才能探到文字元素
    useLayoutEffect(() => {
      if (loading) return
      const pending = pendingPostLoadRef.current
      if (!pending) return
      pendingPostLoadRef.current = null
      // 换文稿后选中页回到第 1 页，滚动位置需一并复位，否则虚拟化会按旧 scrollTop 渲染到无关区域
      stageViewport()?.scrollTo({ top: 0 })
      syncViewport()
      console.log(`[CwPptEditor] 首屏渲染完成 +${Math.round(performance.now() - pending.started)}ms（字体仍在后台解压）`)
      // 字体注册完成后才探测，日志才能反映真实生效情况
      void (pending.fontReady ?? Promise.resolve()).then(logRenderedFonts)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    useEffect(() => {
      if (!modelValue || sameDeck(modelValue, deckRef.current)) return
      const next = cloneDeck(modelValue)
      deckRef.current = next
      setDeck(next)
      setSelected((prev) => Math.min(prev, Math.max(next.slides.length - 1, 0)))
      void registerDeckFonts(next.fonts)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelValue])

    useEffect(() => {
      void registerDeckFonts(deckRef.current.fonts)
      const stage = stageViewport()
      if (!stage) return
      setStageWidth(stage.clientWidth || stageWidth)
      syncViewport()
      const resizeObserver = new ResizeObserver(() => {
        setStageWidth(stage.clientWidth || stageWidth)
        syncViewport()
      })
      resizeObserver.observe(stage)
      return () => {
        resizeObserver.disconnect()
        fontWorkerRef.current?.terminate()
        fontWorkerRef.current = null
        failFontTasks(new Error('组件已卸载'))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        async toArrayBuffer() {
          return deckToArrayBuffer(deckRef.current)
        },
      }),
      [],
    )

    return (
      <div {...rest} className={[pptEditorBase.root, className].filter(Boolean).join(' ')}>
        <div className={pptEditorBase.toolbar}>
          <span className={pptEditorBase.pageLabel}>{slideLabel}</span>
          {error ? <span className={pptEditorBase.statusError}>{error}</span> : null}
          <div className={pptEditorBase.actions}>
            {!previewing ? (
              <>
                <button type="button" className={pptEditorBase.action} onClick={addText}>
                  {texts.addText}
                </button>
                <button type="button" className={pptEditorBase.action} onClick={addSlide}>
                  {texts.addSlide}
                </button>
                <button
                  type="button"
                  className={pptEditorBase.action}
                  disabled={deck.slides.length < 2}
                  onClick={deleteSlide}
                >
                  {texts.deleteSlide}
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className={pptEditorBase.stage}>
          <CwDiv ref={stageRef} className="h-full" persistScrollbar onScroll={onScroll}>
            {!loading ? (
              <div
                className={pptEditorBase.stack}
                style={{ width: `${slideWidth}px`, height: `${totalHeight}px` }}
              >
                {visibleSlots.map((slot) => (
                  <div
                    key={slot.index}
                    data-ppt-slide={slot.index}
                    className={[
                      pptEditorBase.slide,
                      slot.index === selected ? pptEditorBase.slideSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={slideStyle(slot.index)}
                    onClick={() => setSelected(slot.index)}
                  >
                    {slidePaintLayers(deck.slides[slot.index]).map((layer) => {
                      if (layer.kind === 'image') {
                        return (
                          <img
                            key={`image-${layer.id}`}
                            className={imageClass(layer.image)}
                            src={layer.image.dataUrl}
                            alt=""
                            style={imageFrameStyle(layer.image)}
                          />
                        )
                      }
                      if (layer.kind === 'box') {
                        return (
                          <div
                            key={`box-${layer.id}`}
                            className={[
                              pptEditorBase.box,
                              layer.box.id === selectedBox ? pptEditorBase.boxSelected : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={boxFrameStyle(layer.box, deck.slides[slot.index])}
                            onPointerDown={(event) => onBoxPointerDown(slot.index, layer.box, event)}
                          >
                            {layer.box.polygonPoints ? (
                              <svg
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                              >
                                <polygon
                                  points={layer.box.polygonPoints}
                                  fill={boxPolygonFill(layer.box)}
                                  stroke={layer.box.borderColor || 'none'}
                                  strokeWidth={boxSvgStrokeWidth(layer.box)}
                                  strokeOpacity={layer.box.borderOpacity ?? 1}
                                  strokeDasharray={boxSvgStrokeDash(layer.box)}
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                            ) : null}
                            {layer.box.paragraphs?.length ? (
                              <div
                                className={pptEditorBase.boxInput}
                                style={boxTextLayoutStyle(layer.box, deck.slides[slot.index])}
                              >
                                {layer.box.paragraphs.map((para, paraIndex) => (
                                  <p
                                    key={paraIndex}
                                    className={pptEditorBase.boxParagraph}
                                    style={paragraphBlockStyle(layer.box, para)}
                                  >
                                    {para.runs?.length
                                      ? para.runs.map((run, runIndex) => (
                                          <span key={runIndex} style={runTextStyle(layer.box, run)}>
                                            {run.text}
                                          </span>
                                        ))
                                      : para.text}
                                  </p>
                                ))}
                              </div>
                            ) : !previewing ? (
                              <textarea
                                className={pptEditorBase.boxInput}
                                style={boxTextSurfaceStyle(layer.box, deck.slides[slot.index])}
                                value={layer.box.text}
                                onKeyDown={(event) => event.stopPropagation()}
                                onChange={(event) => onBoxInput(layer.box, event.target.value)}
                              />
                            ) : (
                              <div
                                className={pptEditorBase.boxInput}
                                style={boxTextSurfaceStyle(layer.box, deck.slides[slot.index])}
                              >
                                {layer.box.text}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return (
                        <div
                          key={`line-${layer.id}`}
                          className={pptEditorBase.line}
                          style={lineFrameStyle(layer.line)}
                        >
                          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {linePolylineAttr(layer.line) ? (
                              <polyline
                                points={linePolylineAttr(layer.line)}
                                fill="none"
                                strokeLinecap="square"
                                strokeLinejoin="miter"
                                stroke={layer.line.color || tokenSolidColors.docInk}
                                strokeOpacity={layer.line.strokeOpacity ?? 1}
                                strokeWidth={lineWidthPx(layer.line)}
                                vectorEffect="non-scaling-stroke"
                              />
                            ) : (
                              <line
                                x1={linePoint(layer.line).x1}
                                y1={linePoint(layer.line).y1}
                                x2={linePoint(layer.line).x2}
                                y2={linePoint(layer.line).y2}
                                stroke={layer.line.color || tokenSolidColors.docInk}
                                strokeOpacity={layer.line.strokeOpacity ?? 1}
                                strokeWidth={lineWidthPx(layer.line)}
                                vectorEffect="non-scaling-stroke"
                              />
                            )}
                          </svg>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </CwDiv>
          {loading ? (
            <div className={pptEditorBase.loading}>
              <CwLoading type="spinner" size="small" />
              <span className={pptEditorBase.loadingText}>{texts.loadingText}</span>
            </div>
          ) : null}
        </div>
      </div>
    )
  },
)

export default CwPptEditor
