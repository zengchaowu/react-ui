/**
 * 与 tokens.css 中语义色对应的十六进制值（Canvas、WebGL、Fabric 等无法使用 var(--*) 时使用）。
 * 仅在本目录维护 hex；组件内请 import 使用，勿再 hardcode。
 */
export const tokenSolidColors = {
  white: '#FFFFFF',
  black: '#000000',
  scrimBase: '#181818',
  storyDarkBg: '#1A1A1A',
  grayColor15: '#181818',
  bgColorPage: '#F8F8F8',
  bgColorContainer: '#FFFFFF',
  bgColorComponent: '#F3F3F3',
  borderColorLight: '#E7E7E7',
  textColorAnti: '#FFFFFF',
  /** 取色器无法解析时的占位灰 */
  textColorMuted: '#888888',
  /** 文档（PDF / PPTX）默认墨色与线条色：会写回文件，必须保持固定 hex */
  docInk: '#222222',
  docLine: '#666666',
  brandColor6: '#0077FF',
  /** 画布框选区域填充（Fabric 无法用 CSS var） */
  brandColor6SelectionFill: '#0077FF24',
  brandColor5: '#3399FF',
  brandColor4: '#66B3FF',
  errorColor6: '#E1453A',
  errorColor5: '#F6675C',
  errorColor4: '#FF9487',
  errorColor3: '#FFB9B0',
  errorColor2: '#FFD8D2',
  errorColor7: '#B4372E',
  errorColor1: '#FFF0ED',
  successColor6: '#2EA975',
  successColor5: '#52C08B',
  successColor4: '#85D3A8',
  successColor3: '#A4E4BC',
  successColor7: '#25875E',
  warningColor6: '#F8760C',
  warningColor5: '#F9913D',
  warningColor7: '#C65E0A',
  /** Fabric / 画布演示形状 */
  fabricShapeFillWarm: '#F6675C',
  fabricShapeFillCool: '#52C08B',
  fabricShapeFillSky: '#66B3FF',
  fabricEditorFillPink: '#FFB9B0',
  fabricEditorFillCyan: '#A4E4BC',
  fabricEditorFillGreen: '#85D3A8',
  /** ActiveSelection / 未知类型退化包围盒填充 */
  fabricEditorFillMuted: '#E5E7EB',
  /** Three.js 程序化纹理基色 */
  sceneTerrainGrass: '#3A5F4A',
  sceneNormalMapBase: '#8080FF',
  sceneNormalMapHi: '#9090FF',
  sceneNormalMapLo: '#7070FF',
  sceneRoughnessBase: '#E0E0E0',
  sceneRockBase: '#606060',
  sceneTreeTrunk: '#4A3520',
  sceneLeaves: '#2D5016',
  sceneGrassStrokeDark: '#3A6020',
  sceneGrassStrokeLight: '#4A7030',
  /** Storybook / 演示用 */
  storyCanvasMuted: '#F0F0F0',
  storyBorderMuted: '#D1D5DB',
  storyBrandTintBg: '#F0F9FF',
  storyVueFlowEdge: '#6EDE87',
  storyDemoOrange: '#F97316',
  storyDemoSlate: '#94A3B8',
  storyGradientPurpleStart: '#667EEA',
  storyGradientPurpleEnd: '#764BA2',
  storyNightBg: '#1A1A2E',
  storyNightPanel: '#0F172A',
  storyChartGrid: '#E5E7EB',
  storyChartText: '#374151',
} as const

export type TokenSolidColorKey = keyof typeof tokenSolidColors

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Canvas 2D 程序化纹理拼色（rgb） */
export function canvasRgb(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`
}

/** Canvas 2D 程序化纹理拼色（带 alpha） */
export function canvasRgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export const defaultParticleColorList: readonly string[] = [
  tokenSolidColors.warningColor6,
  tokenSolidColors.successColor6,
  tokenSolidColors.errorColor6,
  tokenSolidColors.warningColor5,
]

export const unionFindSetPalette: readonly string[] = [
  tokenSolidColors.warningColor6,
  tokenSolidColors.successColor6,
  tokenSolidColors.errorColor6,
  tokenSolidColors.warningColor5,
  tokenSolidColors.successColor5,
  tokenSolidColors.errorColor5,
  tokenSolidColors.successColor7,
  tokenSolidColors.errorColor7,
  tokenSolidColors.warningColor7,
  tokenSolidColors.successColor4,
]
