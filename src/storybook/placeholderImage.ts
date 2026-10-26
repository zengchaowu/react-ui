const PLACEHOLDER_COLORS: Array<[string, string]> = [
  ['#c7d2fe', '#818cf8'],
  ['#bbf7d0', '#4ade80'],
  ['#fde68a', '#f59e0b'],
  ['#fbcfe8', '#f472b6'],
  ['#a5f3fc', '#22d3ee'],
]

/**
 * Storybook 离线占位图 URL（SVG data URI）。
 * picsum.photos 等外部图床在部分网络下不可访问，story 里的示例图统一用本函数生成。
 * @param width 图片宽度（px）
 * @param height 图片高度（px）
 * @param index 配色下标，用于让多张占位图有区分度
 */
export function storybookPlaceholderImage(
  width: number,
  height: number,
  index = 0,
): string {
  const [from, to] = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
  const fontSize = Math.max(12, Math.round(Math.min(width, height) / 8))
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="#ffffff" fill-opacity="0.85" font-family="sans-serif"` +
    ` font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">` +
    `${width}x${height}</text></svg>`
  // 整段编码，保证 URL 里不含空白、引号和括号：Markdown 图片语法和 CSS url() 都能直接用。
  const encoded = encodeURIComponent(svg)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}
