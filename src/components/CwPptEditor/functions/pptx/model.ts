import type { CwPptBox, CwPptDeck, CwPptSlide, CwPptSource } from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import { EMU_CX, EMU_CY, EMU_PER_PT } from './shared'

export function slideSizePt(slideCx: number, slideCy: number) {
  return {
    width: Math.round(slideCx / EMU_PER_PT) || 960,
    height: Math.round(slideCy / EMU_PER_PT) || 540,
  }
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlankDeck(): CwPptDeck {
  return {
    width: 960,
    height: 540,
    slideCx: EMU_CX,
    slideCy: EMU_CY,
    slides: [blankSlide(1)],
  }
}

export function textBox(text: string, fontSize: number, y: number, h: number, z: number): CwPptBox {
  return {
    id: createId('box'),
    x: 0.08,
    y,
    w: 0.84,
    h,
    text,
    fontSize,
    color: tokenSolidColors.docInk,
    fill: '',
    align: 'left',
    z,
  }
}

export function blankSlide(index: number): CwPptSlide {
  return {
    name: `幻灯片 ${index}`,
    background: tokenSolidColors.white,
    boxes: [textBox('标题', 32, 0.16, 0.16, 0), textBox('正文', 18, 0.4, 0.4, 1)],
    images: [],
    lines: [],
  }
}

export function cloneDeck(deck: CwPptDeck): CwPptDeck {
  return {
    width: deck.width,
    height: deck.height,
    slideCx: deck.slideCx || EMU_CX,
    slideCy: deck.slideCy || EMU_CY,
    slides: deck.slides.map((slide) => ({
      name: slide.name,
      background: slide.background || tokenSolidColors.white,
      boxes: slide.boxes.map((box, index) => ({
        ...box,
        color: box.color || tokenSolidColors.docInk,
        fill: box.fill || '',
        align: box.align || 'left',
        z: box.z ?? index,
      })),
      images: slide.images.map((image, index) => ({ ...image, z: image.z ?? index })),
      lines: (slide.lines ?? []).map((line, index) => ({
        ...line,
        color: line.color || tokenSolidColors.docInk,
        widthPt: line.widthPt || 1,
        z: line.z ?? index,
      })),
    })),
    fonts: deck.fonts?.map((font) => ({ ...font })),
  }
}

export function sameDeck(left: CwPptDeck, right: CwPptDeck) {
  // fonts 存的是内嵌字体原始字节（可达十几 MB），不参与比较，避免无谓的序列化开销
  const { fonts: _leftFonts, ...leftRest } = left
  const { fonts: _rightFonts, ...rightRest } = right
  return JSON.stringify(leftRest) === JSON.stringify(rightRest)
}

export async function readPptSource(src: CwPptSource): Promise<ArrayBuffer> {
  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    return response.arrayBuffer()
  }
  if (src instanceof Blob) return src.arrayBuffer()
  return src
}
