import type { CwPptBox, CwPptDeck, CwPptImage, CwPptLine } from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import { A, EMU_CX, EMU_CY, P, R, RELS } from './shared'
import { escapeXml } from './xml'
import { blankSlide } from './model'

export function dataUrlBytes(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  const mime = match[1] || ''
  const ext = mime.includes('png') ? 'png' : 'jpeg'
  const binary = atob(match[2] || '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return { bytes, ext, mime }
}

export function placeOnSlide(origin: number, span: number, size: number) {
  const start = Math.min(size - 1, Math.max(0, Math.round(origin * size)))
  const length = Math.min(size - start, Math.max(1, Math.round(span * size)))
  return { start, length }
}

export function textBody(box: CwPptBox) {
  const size = Math.max(100, Math.round(box.fontSize * 100))
  const color = (box.color || tokenSolidColors.docInk).replace('#', '')
  const align = box.align === 'center' ? 'ctr' : box.align === 'right' ? 'r' : 'l'
  const paragraphs = (box.text || '').split('\n').map((line) => {
    if (!line) return `<a:p><a:pPr algn="${align}"/></a:p>`
    const boldTag = box.bold ? '<a:b/>' : ''
    return `<a:p><a:pPr algn="${align}"/><a:r><a:rPr lang="zh-CN" sz="${size}" dirty="0"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill>${boldTag}<a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/></a:rPr><a:t>${escapeXml(line)}</a:t></a:r></a:p>`
  })
  return `<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paragraphs.join('') || `<a:p><a:pPr algn="${align}"/></a:p>`}</p:txBody>`
}

export function shapeXml(box: CwPptBox, id: number, slideCx: number, slideCy: number) {
  const x = placeOnSlide(box.x, box.w, slideCx)
  const y = placeOnSlide(box.y, box.h, slideCy)
  const fillHex = box.fill.replace('#', '')
  const alpha =
    box.fillOpacity !== undefined && box.fillOpacity < 0.999
      ? `<a:alpha val="${Math.max(0, Math.min(100000, Math.round(box.fillOpacity * 100000)))}"/>`
      : ''
  const fill = box.fill
    ? `<a:solidFill><a:srgbClr val="${fillHex}">${alpha}</a:srgbClr></a:solidFill>`
    : '<a:noFill/>'
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="文本 ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${fill}</p:spPr>${textBody(box)}</p:sp>`
}

export function lineXml(line: CwPptLine, id: number, slideCx: number, slideCy: number) {
  const x = placeOnSlide(line.x, line.w, slideCx)
  const y = placeOnSlide(line.y, line.h, slideCy)
  const color = (line.color || tokenSolidColors.docInk).replace('#', '')
  const width = Math.max(1270, Math.round((line.widthPt || 1) * 12700))
  const flipH = line.flipH ? ' flipH="1"' : ''
  const flipV = line.flipV ? ' flipV="1"' : ''
  const rot = line.rot ? ` rot="${Math.round(line.rot * 60000)}"` : ''
  return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="线条 ${id}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm${flipH}${flipV}${rot}><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="${width}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:ln></p:spPr></p:cxnSp>`
}

export function pictureXml(image: CwPptImage, id: number, relId: string, slideCx: number, slideCy: number) {
  const x = placeOnSlide(image.x, image.w, slideCx)
  const y = placeOnSlide(image.y, image.h, slideCy)
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="图片 ${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`
}

export const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1F4E79"/></a:dk2>
      <a:lt2><a:srgbClr val="E7F2E4"/></a:lt2>
      <a:accent1><a:srgbClr val="2B9A4B"/></a:accent1>
      <a:accent2><a:srgbClr val="5B9BD5"/></a:accent2>
      <a:accent3><a:srgbClr val="ED7D31"/></a:accent3>
      <a:accent4><a:srgbClr val="A5A5A5"/></a:accent4>
      <a:accent5><a:srgbClr val="FFC000"/></a:accent5>
      <a:accent6><a:srgbClr val="4472C4"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`

export function groupTree(cx: number, cy: number) {
  return `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/><a:chOff x="0" y="0"/><a:chExt cx="${cx}" cy="${cy}"/></a:xfrm></p:grpSpPr>`
}

export function slideXml(name: string, body: string, background: string, cx: number, cy: number) {
  const hex = (background || tokenSolidColors.white).replace('#', '')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld name="${escapeXml(name)}"><p:bg><p:bgPr><a:solidFill><a:srgbClr val="${hex}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${groupTree(cx, cy)}${body}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`
}

export async function deckToArrayBuffer(deck: CwPptDeck): Promise<ArrayBuffer> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const slideCx = deck.slideCx || EMU_CX
  const slideCy = deck.slideCy || EMU_CY
  const slides = deck.slides.length ? deck.slides : [blankSlide(1)]
  const contentTypes = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Default Extension="png" ContentType="image/png"/>',
    '<Default Extension="jpeg" ContentType="image/jpeg"/>',
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
    '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
  ]
  const presRels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    `<Relationships xmlns="${RELS}">`,
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
  ]
  const slideIds: string[] = []
  let mediaIndex = 1

  for (const [index, slide] of slides.entries()) {
    const slideNo = index + 1
    const relId = `rId${index + 2}`
    contentTypes.push(`<Override PartName="/ppt/slides/slide${slideNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`)
    presRels.push(`<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNo}.xml"/>`)
    slideIds.push(`<p:sldId id="${256 + index}" r:id="${relId}"/>`)
    const rels = [
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      `<Relationships xmlns="${RELS}">`,
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>',
    ]
    let shapeId = 2
    const parts: string[] = []
    for (const image of slide.images) {
      const file = dataUrlBytes(image.dataUrl)
      if (!file) continue
      const mediaName = `image${mediaIndex}.${file.ext}`
      mediaIndex += 1
      zip.file(`ppt/media/${mediaName}`, file.bytes)
      const imageRel = `rId${rels.length - 1}`
      rels.push(`<Relationship Id="${imageRel}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>`)
      parts.push(pictureXml(image, shapeId, imageRel, slideCx, slideCy))
      shapeId += 1
    }
    for (const line of slide.lines ?? []) {
      parts.push(lineXml(line, shapeId, slideCx, slideCy))
      shapeId += 1
    }
    for (const box of slide.boxes) {
      parts.push(shapeXml(box, shapeId, slideCx, slideCy))
      shapeId += 1
    }
    rels.push('</Relationships>')
    zip.file(`ppt/slides/slide${slideNo}.xml`, slideXml(slide.name, parts.join(''), slide.background, slideCx, slideCy))
    zip.file(`ppt/slides/_rels/slide${slideNo}.xml.rels`, rels.join(''))
  }

  presRels.push('</Relationships>')
  contentTypes.push('</Types>')
  zip.file('[Content_Types].xml', contentTypes.join(''))
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`)
  zip.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>演示文稿</dc:title></cp:coreProperties>')
  zip.file('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>CwPptEditor</Application></Properties>')
  zip.file('ppt/_rels/presentation.xml.rels', presRels.join(''))
  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideIds.join('')}</p:sldIdLst><p:sldSz cx="${slideCx}" cy="${slideCy}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`)
  zip.file('ppt/theme/theme1.xml', themeXml)
  zip.file('ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${groupTree(slideCx, slideCy)}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`)
  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`)
  zip.file('ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}" type="blank" preserve="1"><p:cSld name="空白"><p:spTree>${groupTree(slideCx, slideCy)}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`)
  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`)

  return zip.generateAsync({ type: 'arraybuffer' })
}
