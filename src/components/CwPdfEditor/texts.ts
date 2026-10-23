import type { CwPdfEditorTexts } from './types'

export const defaultTexts: CwPdfEditorTexts = {
  loadingText: '正在读取 PDF…',
  loadError: '无法读取这个 PDF',
  pageText: '第 {current} 页，共 {total} 页',
  zoomIn: '放大',
  zoomOut: '缩小',
  addText: '添加文字',
  rotate: '旋转',
  duplicatePage: '复制本页',
  addPage: '添加空白页',
  deletePage: '删除本页',
  moveUp: '上移',
  moveDown: '下移',
  runDecodePlaceholder: '原文编码无法识别，请重新输入',
}
