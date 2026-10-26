import type { CwPptEmbeddedFont, CwPptSlide } from '../../types'
import type { PptxArchivePayload } from '../archiveEntries'
import { P, R, type ZipRel } from './shared'
import { childEl, resolveTarget } from './xml'

/** p:embeddedFont regular/bold/italic/boldItalic 变体 → 字重/斜体 */
export const EMBED_FONT_VARIANTS: { tag: string; weight?: string; style?: 'italic' }[] = [
  { tag: 'regular', weight: '400' },
  { tag: 'bold', weight: '700' },
  { tag: 'italic', weight: '400', style: 'italic' },
  { tag: 'boldItalic', weight: '700', style: 'italic' },
]

/**
 * 读取 p:embeddedFontLst 内嵌字体，只取 .fntdata 的原始字节（EOT 容器）。
 * 解压是同步重活（单个中文字体可达数秒），统一交给 Worker，解析阶段绝不触碰。
 * 文稿里没引用到的字体直接跳过，省掉解压与 FontFace 解析的整份开销。
 */
export async function readEmbeddedFonts(
  zip: PptxArchivePayload,
  pres: Document,
  presRels: Map<string, ZipRel>,
  usedFamilies: Set<string>,
): Promise<CwPptEmbeddedFont[]> {
  const lst = pres.getElementsByTagNameNS(P, 'embeddedFontLst')[0]
  if (!lst) {
    console.log('[CwPptEditor] 该 pptx 未声明内嵌字体（p:embeddedFontLst 不存在）')
    return []
  }
  const children = [...lst.children].filter((el) => el.localName === 'embeddedFont')
  console.log(`[CwPptEditor] 内嵌字体声明 ${children.length} 个：`, children.map((el) => childEl(el, 'font')?.getAttribute('typeface')))
  const fonts: CwPptEmbeddedFont[] = []
  for (const embedded of children) {
    const family = childEl(embedded, 'font')?.getAttribute('typeface')?.trim()
    if (!family) continue
    if (usedFamilies.size && !usedFamilies.has(family)) {
      console.log(`[CwPptEditor] 内嵌字体 ${family} 未被文稿引用，跳过解压`)
      continue
    }
    for (const variant of EMBED_FONT_VARIANTS) {
      const ref = childEl(embedded, variant.tag)
      const relId = ref?.getAttributeNS(R, 'id') || ref?.getAttribute('r:id') || ''
      const target = relId ? presRels.get(relId)?.target : ''
      if (!target) continue
      const path = resolveTarget('ppt/presentation.xml', target)
      // 字节由 Worker 解压并转移过来，这里只查表，不再触发任何解压
      const bytes = zip.binary[path]
      if (!bytes) {
        console.warn(`[CwPptEditor] 内嵌字体 ${family}(${variant.tag}) 指向的 ${path} 不存在，已跳过`)
        continue
      }
      fonts.push({
        family,
        weight: variant.weight,
        style: variant.style ?? 'normal',
        bytes,
      })
    }
  }
  return fonts
}

/** 文稿里实际写进 CSS font-family 栈的字体名，用于剔除未被引用的内嵌字体 */
export function collectUsedFontFamilies(slides: CwPptSlide[]) {
  const used = new Set<string>()
  const bump = (stack?: string) => {
    for (const [, name] of (stack ?? '').matchAll(/"([^"]+)"/g)) {
      if (name) used.add(name)
    }
  }
  for (const slide of slides) {
    for (const box of slide.boxes) {
      bump(box.fontFamily)
      for (const para of box.paragraphs ?? []) {
        bump(para.fontFamily)
        for (const run of para.runs ?? []) bump(run.fontFamily)
      }
    }
  }
  return used
}
