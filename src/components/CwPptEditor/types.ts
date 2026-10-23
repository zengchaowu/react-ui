import type { HTMLAttributes } from 'react'

export type CwPptAlign = 'left' | 'center' | 'right'

/** 与 ppt bodyPr 一致：缩小字体适应框 / 框随字变大 */
export type CwPptTextFit = 'none' | 'norm' | 'shape'

/** 文本内边距，相对整页幻灯片宽高的比例（由 EMU 换算） */
export interface CwPptTextPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface CwPptTextRun {
  text: string
  fontSize: number
  color: string
  bold?: boolean
  fontFamily?: string
}

/** 文本框内单段（可含多 run 不同字号/颜色） */
export interface CwPptTextParagraph {
  text: string
  fontSize: number
  color: string
  align: CwPptAlign
  bold?: boolean
  fontFamily?: string
  /** 行距倍数，来自 a:lnSpc/a:spcPct（如 125000 → 1.25） */
  lineHeight?: number
  runs?: CwPptTextRun[]
}

export interface CwPptBorderSide {
  color: string
  widthPt: number
  opacity?: number
  dash?: 'solid' | 'dashed' | 'dotted'
}

export interface CwPptCellBorders {
  top?: CwPptBorderSide
  right?: CwPptBorderSide
  bottom?: CwPptBorderSide
  left?: CwPptBorderSide
}

/** 幻灯片上的文字或色块。坐标是幻灯片宽高的比例。 */
export interface CwPptBox {
  id: string
  x: number
  y: number
  w: number
  h: number
  text: string
  /** 字号，单位磅 */
  fontSize: number
  /** 文字颜色，#RRGGBB */
  color: string
  /** 整段加粗（无 paragraphs 时） */
  bold?: boolean
  fontFamily?: string
  /** 填充色，#RRGGBB。空字符串表示透明。 */
  fill: string
  /** 形状填充不透明度 0–1（OOXML a:alpha / 100000） */
  fillOpacity?: number
  /** prstGeom：椭圆 / 圆角矩形 / 六边形等 */
  geomPreset?: 'ellipse' | 'roundRect' | 'hexagon' | 'rtTriangle'
  /** 绕包围盒中心顺时针旋转，度 */
  rot?: number
  /** roundRect 圆角，CSS border-radius 百分比 */
  roundRectRadius?: number
  /** 多边形顶点，viewBox 0–100（hexagon 等） */
  polygonPoints?: string
  /** noFill + a:ln 描边（非填充色块） */
  borderColor?: string
  borderWidthPt?: number
  borderOpacity?: number
  borderDash?: 'solid' | 'dashed' | 'dotted'
  /** 表格单元格四边描边（可各边不同） */
  borders?: CwPptCellBorders
  align: CwPptAlign
  textFit?: CwPptTextFit
  padding?: CwPptTextPadding
  /** bodyPr anchor：段落在形状内的垂直对齐 */
  vAnchor?: 'top' | 'center' | 'bottom'
  paragraphs?: CwPptTextParagraph[]
  /** 叠放顺序，小的在下面 */
  z: number
}

/** 图片源区域裁剪，相对原图四边比例 0–1（OOXML srcRect / 100000） */
export interface CwPptImageCrop {
  left: number
  top: number
  right: number
  bottom: number
}

export interface CwPptImage {
  id: string
  x: number
  y: number
  w: number
  h: number
  dataUrl: string
  crop?: CwPptImageCrop
  /** 叠放顺序，小的在下面 */
  z: number
}

/** 直线或连接线。在包围盒内从一角画到对角。 */
export interface CwPptLine {
  id: string
  x: number
  y: number
  w: number
  h: number
  /** 线条颜色，#RRGGBB */
  color: string
  /** 描边不透明度 0–1，缺省为 1 */
  strokeOpacity?: number
  /** 线宽，磅 */
  widthPt: number
  flipH?: boolean
  flipV?: boolean
  /** 绕包围盒中心顺时针旋转，度 */
  rot?: number
  /** prstGeom 连接线预设（bentConnector 等） */
  geomPreset?: string
  /** 连接线折点，viewBox 0–100 坐标 */
  polyline?: { x: number; y: number }[]
  /** 叠放顺序，小的在下面 */
  z: number
}

export interface CwPptSlide {
  name: string
  /** 背景色，#RRGGBB */
  background: string
  boxes: CwPptBox[]
  images: CwPptImage[]
  lines: CwPptLine[]
}

/** pptx 内嵌字体（p:embeddedFontLst）：.fntdata 是 EOT 容器，原始字节由 Worker 解压成 TTF 后交组件注册 */
export interface CwPptEmbeddedFont {
  /** 字体族名（embeddedFont 的 typeface），需与 font-family 栈首一致 */
  family: string
  /** regular=400，bold=700 */
  weight?: string
  style?: 'normal' | 'italic'
  /** EOT 原始字节。解压耗时较长，交给 Worker 执行，解析阶段不做任何同步解压/编码 */
  bytes: Uint8Array
}

export interface CwPptDeck {
  /** 幻灯片宽，单位磅（由 slideCx EMU 换算），用于预览宽高比 */
  width: number
  /** 幻灯片高，单位磅（由 slideCy EMU 换算），字号按此与预览高度比例缩放 */
  height: number
  /** 幻灯片宽高，EMU。导出时用这个尺寸，避免和内容坐标系不一致。 */
  slideCx: number
  slideCy: number
  slides: CwPptSlide[]
  /** 内嵌字体，解析 pptx 时自动解压；组件负责 FontFace 注册 */
  fonts?: CwPptEmbeddedFont[]
}

/** pptx 来源。字符串按 URL 拉取。 */
export type CwPptSource = string | ArrayBuffer | Blob

export interface CwPptEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'>,
    CwPptEditorEmits {
  /** 受控幻灯片。传入后以其为准，直到 src 再次变化。 */
  modelValue?: CwPptDeck
  /** 从网址、二进制或 Blob 读入 pptx */
  src?: CwPptSource | null
  /**
   * preview 只查看。
   * edit 可改文字、移动文字框，并增删幻灯片。
   * @default 'edit'
   */
  mode?: 'preview' | 'edit'
  /** 只读查看，效果同 mode="preview" */
  readonly?: boolean
  texts?: Partial<CwPptEditorTexts>
  /** 根容器额外 class（对应 Vue attrs.class） */
  className?: string
}

export interface CwPptEditorTexts {
  loadingText: string
  loadError: string
  slideText: string
  addText: string
  addSlide: string
  deleteSlide: string
}

export interface CwPptEditorEmits {
  /** 对应 Vue `update:modelValue` */
  onModelValueChange?: (deck: CwPptDeck) => void
  /** 对应 Vue `change` */
  onChange?: (deck: CwPptDeck) => void
}

/** defineExpose 对应的 imperative handle */
export interface CwPptEditorHandle {
  toArrayBuffer: () => Promise<ArrayBuffer>
}

export interface CwPptEditorStyles {
  root: string
  toolbar: string
  pageLabel: string
  actions: string
  action: string
  stage: string
  stack: string
  slide: string
  slideSelected: string
  box: string
  boxSelected: string
  boxInput: string
  boxParagraph: string
  image: string
  imageCrop: string
  imageCover: string
  line: string
  loading: string
  loadingText: string
  statusError: string
}
