import type { CwPdfNote, CwPdfTextRun } from '@zengchaowu/ui-shared/components/CwPdfEditor/types'
import {
  cssFontStackForOverlay,
  cssFontStyle,
  cssFontWeight,
  layoutPdfRun,
  measurePdfRunFont,
  type CwPdfViewport,
} from './pdfDocument'

const A4_REF_HEIGHT = 841.89
const EMPTY_RUN_MEASURE = '\u3000'

export function noteFontPx(note: CwPdfNote, pageHeight: number) {
  return Math.max(12, note.fontSize * (pageHeight / A4_REF_HEIGHT))
}

export function noteBoxStyle(note: CwPdfNote, pageHeight: number) {
  return {
    left: `${note.x * 100}%`,
    top: `${note.y * 100}%`,
    width: `${note.w * 100}%`,
    height: `${note.h * 100}%`,
    fontSize: `${noteFontPx(note, pageHeight)}px`,
  }
}

export const runEditorInheritedStyle = {
  fontSize: 'inherit',
  lineHeight: 'inherit',
  fontFamily: 'inherit',
}

export function runOverlayStyle(run: CwPdfTextRun, viewport: CwPdfViewport, pageHeight: number) {
  if (pageHeight < 2) return { display: 'none' }
  const layout = layoutPdfRun(run, viewport, pageHeight)
  const measureText = run.text || run.source || EMPTY_RUN_MEASURE
  const metrics = measurePdfRunFont(measureText, layout.fontCss, run.fontFamily, run.pdfFont, run.fontFace)
  const fontFamily = cssFontStackForOverlay(run.fontFamily, run.pdfFont, run.fontFace)
  return {
    left: `${(layout.left / viewport.width) * 100}%`,
    top: `${(layout.top / viewport.height) * 100}%`,
    width: `${(layout.width / viewport.width) * 100}%`,
    height: `${(layout.height / viewport.height) * 100}%`,
    fontSize: `${layout.fontCss}px`,
    lineHeight: `${metrics.ascent + metrics.descent}px`,
    fontFamily,
    fontWeight: cssFontWeight(run.fontFamily),
    fontStyle: cssFontStyle(run.fontFamily),
    transform: Math.abs(layout.angle) > 0.01 ? `rotate(${layout.angle}rad)` : undefined,
    transformOrigin: 'top left',
  }
}

export function filterVisibleRuns(runs: CwPdfTextRun[], previewing: boolean) {
  if (!previewing) return runs
  return runs.filter((run) => run.text !== run.source)
}
