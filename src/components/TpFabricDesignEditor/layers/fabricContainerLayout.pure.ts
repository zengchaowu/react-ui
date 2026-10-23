import type { FabricObject, Group } from 'fabric'
import {
  getFabricContainerLayout,
  isFabricContainerFrame,
  isFabricContainerObject,
  syncFabricContainerFrameLocalRect,
  type FabricContainerLayout,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'

export type FabricContainerContentBox = {
  left: number
  top: number
  width: number
  height: number
}

/** 图层面板自上而下顺序（树顶优先） */
export function listFabricContainerContentChildren(
  container: Group,
): FabricObject[] {
  return (container.getObjects() as FabricObject[])
    .filter((o) => !isFabricContainerFrame(o) && o.visible !== false)
    .slice()
    .reverse()
}

export function readFabricObjectLocalTopLeft(obj: FabricObject): {
  x: number
  y: number
} {
  const w = Math.abs(obj.getScaledWidth())
  const h = Math.abs(obj.getScaledHeight())
  let x = obj.left ?? 0
  let y = obj.top ?? 0
  if (obj.originX === 'center') x -= w / 2
  else if (obj.originX === 'right') x -= w
  if (obj.originY === 'center') y -= h / 2
  else if (obj.originY === 'bottom') y -= h
  return { x, y }
}

export function writeFabricObjectLocalTopLeft(
  obj: FabricObject,
  x: number,
  y: number,
): void {
  const w = Math.abs(obj.getScaledWidth())
  const h = Math.abs(obj.getScaledHeight())
  let left = x
  let top = y
  if (obj.originX === 'center') left += w / 2
  else if (obj.originX === 'right') left += w
  if (obj.originY === 'center') top += h / 2
  else if (obj.originY === 'bottom') top += h
  obj.set({ left, top })
  obj.setCoords()
}

/**
 * 内容盒：优先用画板 Rect 的逻辑尺寸与局部左上角（不含描边外扩）。
 * 否则用容器宽高（中心坐标系）。
 */
export function readFabricContainerContentBox(
  container: FabricContainerObject,
): FabricContainerContentBox {
  const frame = (container.getObjects() as FabricObject[]).find((o) =>
    isFabricContainerFrame(o),
  )
  if (frame) {
    const width = Math.max(
      1,
      Math.abs((frame.width ?? 1) * (frame.scaleX ?? 1)),
    )
    const height = Math.max(
      1,
      Math.abs((frame.height ?? 1) * (frame.scaleY ?? 1)),
    )
    if (frame.originX === 'center' && frame.originY === 'center') {
      return {
        left: (frame.left ?? 0) - width / 2,
        top: (frame.top ?? 0) - height / 2,
        width,
        height,
      }
    }
    const tl = readFabricObjectLocalTopLeft(frame)
    return {
      left: tl.x,
      top: tl.y,
      width,
      height,
    }
  }
  const width = Math.max(1, Math.abs(container.width ?? 1))
  const height = Math.max(1, Math.abs(container.height ?? 1))
  return { left: -width / 2, top: -height / 2, width, height }
}

function sizeOf(obj: FabricObject): { w: number; h: number } {
  return {
    w: Math.max(0.1, Math.abs(obj.getScaledWidth())),
    h: Math.max(0.1, Math.abs(obj.getScaledHeight())),
  }
}

function computeStackPositions(
  children: FabricObject[],
  box: FabricContainerContentBox,
  layout: FabricContainerLayout,
): Array<{ obj: FabricObject; x: number; y: number }> {
  const gap = layout.gap ?? 0
  const pad = layout.padding ?? 0
  const direction = layout.direction ?? 'vertical'
  const align = layout.align ?? 'start'
  const justify = layout.justify ?? 'start'
  const sizes = children.map(sizeOf)
  const innerW = Math.max(0, box.width - pad * 2)
  const innerH = Math.max(0, box.height - pad * 2)
  const out: Array<{ obj: FabricObject; x: number; y: number }> = []

  if (direction === 'vertical') {
    const totalH =
      sizes.reduce((s, it) => s + it.h, 0) +
      Math.max(0, children.length - 1) * gap
    let cursorY = box.top + pad
    if (justify === 'center') cursorY += Math.max(0, (innerH - totalH) / 2)
    else if (justify === 'end') cursorY += Math.max(0, innerH - totalH)
    const free =
      justify === 'space-between' && children.length > 1
        ? Math.max(0, innerH - sizes.reduce((s, it) => s + it.h, 0)) /
          (children.length - 1)
        : gap

    for (let i = 0; i < children.length; i += 1) {
      const obj = children[i]!
      const { w, h } = sizes[i]!
      let x = box.left + pad
      if (align === 'center') x += (innerW - w) / 2
      else if (align === 'end') x += innerW - w
      else if (align === 'stretch') {
        // 仅定位；拉伸改尺寸另议，保持左对齐
        x = box.left + pad
      }
      out.push({ obj, x, y: cursorY })
      cursorY += h + (justify === 'space-between' ? free : gap)
    }
    return out
  }

  // horizontal
  const totalW =
    sizes.reduce((s, it) => s + it.w, 0) + Math.max(0, children.length - 1) * gap
  let cursorX = box.left + pad
  if (justify === 'center') cursorX += Math.max(0, (innerW - totalW) / 2)
  else if (justify === 'end') cursorX += Math.max(0, innerW - totalW)
  const free =
    justify === 'space-between' && children.length > 1
      ? Math.max(0, innerW - sizes.reduce((s, it) => s + it.w, 0)) /
        (children.length - 1)
      : gap

  for (let i = 0; i < children.length; i += 1) {
    const obj = children[i]!
    const { w, h } = sizes[i]!
    let y = box.top + pad
    if (align === 'center') y += (innerH - h) / 2
    else if (align === 'end') y += innerH - h
    out.push({ obj, x: cursorX, y })
    cursorX += w + (justify === 'space-between' ? free : gap)
  }
  return out
}

function computeGridPositions(
  children: FabricObject[],
  box: FabricContainerContentBox,
  layout: FabricContainerLayout,
): Array<{ obj: FabricObject; x: number; y: number }> {
  const gap = layout.gap ?? 0
  const pad = layout.padding ?? 0
  const columns = Math.max(1, layout.columns ?? 2)
  const align = layout.align ?? 'start'
  const innerW = Math.max(0, box.width - pad * 2)
  const innerH = Math.max(0, box.height - pad * 2)
  const colW =
    columns <= 0 ? innerW : (innerW - gap * Math.max(0, columns - 1)) / columns
  const rows = Math.max(1, Math.ceil(children.length / columns))
  const rowH =
    rows <= 0 ? innerH : (innerH - gap * Math.max(0, rows - 1)) / rows
  const out: Array<{ obj: FabricObject; x: number; y: number }> = []

  for (let i = 0; i < children.length; i += 1) {
    const obj = children[i]!
    const { w, h } = sizeOf(obj)
    const col = i % columns
    const row = Math.floor(i / columns)
    const cellLeft = box.left + pad + col * (colW + gap)
    const cellTop = box.top + pad + row * (rowH + gap)
    let x = cellLeft
    let y = cellTop
    if (align === 'center') {
      x += (colW - w) / 2
      y += (rowH - h) / 2
    } else if (align === 'end') {
      x += colW - w
      y += rowH - h
    }
    out.push({ obj, x, y })
  }
  return out
}

/**
 * 按容器布局写回直接子图层坐标；`align:stretch` 时拉伸可伸缩子项。
 * `free` 仅处理 stretch 尺寸（若适用）否则 no-op。
 * @returns 是否发生了坐标/尺寸变更
 */
export function applyFabricContainerLayout(
  container: FabricObject,
): boolean {
  if (!isFabricContainerObject(container)) return false
  const layout = getFabricContainerLayout(container)
  const children = listFabricContainerContentChildren(container)
  if (!children.length) return false

  const box = readFabricContainerContentBox(container)
  let changed = stretchFabricContainerChildren(container, children, box, layout)

  if (layout.mode === 'free') {
    if (changed) container.setCoords()
    return changed
  }

  const placements =
    layout.mode === 'grid'
      ? computeGridPositions(children, box, layout)
      : computeStackPositions(children, box, layout)

  for (const { obj, x, y } of placements) {
    const prev = readFabricObjectLocalTopLeft(obj)
    if (Math.abs(prev.x - x) > 0.01 || Math.abs(prev.y - y) > 0.01) {
      changed = true
    }
    writeFabricObjectLocalTopLeft(obj, x, y)
  }
  container.setCoords()
  return changed
}

function stretchFabricContainerChildren(
  container: FabricContainerObject,
  children: FabricObject[],
  box: FabricContainerContentBox,
  layout: FabricContainerLayout,
): boolean {
  if (layout.align !== 'stretch') return false
  if (layout.mode === 'free') return false
  const pad = layout.padding ?? 0
  const innerW = Math.max(1, box.width - pad * 2)
  const innerH = Math.max(1, box.height - pad * 2)
  const direction = layout.direction ?? 'vertical'
  let changed = false

  for (const child of children) {
    if (isFabricContainerObject(child)) {
      const cw = Math.max(1, Number(child.width) || 1)
      const ch = Math.max(1, Number(child.height) || 1)
      if (direction === 'vertical' && Math.abs(cw - innerW) > 0.5) {
        syncFabricContainerFrameLocalRect(child, innerW, ch)
        changed = true
      } else if (direction === 'horizontal' && Math.abs(ch - innerH) > 0.5) {
        syncFabricContainerFrameLocalRect(child, cw, innerH)
        changed = true
      }
      continue
    }
    const type = String(child.type ?? '').toLowerCase()
    if (type !== 'rect') continue
    if (direction === 'vertical') {
      const nextW = innerW / Math.max(0.001, Math.abs(child.scaleX ?? 1))
      if (Math.abs((child.width ?? 0) - nextW) > 0.5) {
        child.set({ width: nextW })
        child.setCoords()
        changed = true
      }
    } else {
      const nextH = innerH / Math.max(0.001, Math.abs(child.scaleY ?? 1))
      if (Math.abs((child.height ?? 0) - nextH) > 0.5) {
        child.set({ height: nextH })
        child.setCoords()
        changed = true
      }
    }
  }
  if (changed) container.setCoords()
  return changed
}

/** 若对象是容器，或父级是 stack/grid 容器，则对其应用布局。 */
export function applyFabricContainerLayoutIfNeeded(
  target: FabricObject | null | undefined,
): boolean {
  if (!target) return false
  let changed = false
  if (isFabricContainerObject(target)) {
    if (applyFabricContainerLayout(target)) changed = true
  }
  const parent = target.group
  if (parent && isFabricContainerObject(parent)) {
    const mode = getFabricContainerLayout(parent).mode
    if (mode !== 'free' && applyFabricContainerLayout(parent)) changed = true
  }
  return changed
}
