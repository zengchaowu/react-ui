import {
  Control,
  controlsUtils,
  type FabricObject as TFabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

const ROTATE_OFFSET_PX = 18
const ROTATE_HIT_PX = 20

/**
 * Figma 风格：角点略外侧的隐形旋转热区（不画手柄，只换旋转光标并拖动旋转）。
 */
function createCornerRotateControl(options: {
  x: number
  y: number
  offsetX: number
  offsetY: number
  cursor: string
}): Control {
  return new Control({
    x: options.x,
    y: options.y,
    offsetX: options.offsetX,
    offsetY: options.offsetY,
    cursorStyle: options.cursor,
    cursorStyleHandler: controlsUtils.rotationStyleHandler,
    actionHandler: controlsUtils.rotationWithSnapping,
    actionName: 'rotate',
    sizeX: ROTATE_HIT_PX,
    sizeY: ROTATE_HIT_PX,
    touchSizeX: ROTATE_HIT_PX + 10,
    touchSizeY: ROTATE_HIT_PX + 10,
    withConnection: false,
    // 不绘制可见旋钮；靠 cursor 提示（与 Figma「再往外一点可旋转」一致）
    render: () => undefined,
  })
}

/** 简易旋转光标（黑描边弯箭），按角方位旋转 */
function rotateCursorCss(degrees: number): string {
  const stroke = tokenSolidColors.grayColor15
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(${degrees} 12 12)" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 9.2a5.2 5.2 0 1 1 1.2 6.1"/><path d="M7.5 6.8V9.2H9.9"/></g></svg>`,
  )
  return `url("data:image/svg+xml;charset=utf-8,${svg}") 12 12, crosshair`
}

export function createFabricEditorCornerRotateControls(): Record<string, Control> {
  return {
    tlRotate: createCornerRotateControl({
      x: -0.5,
      y: -0.5,
      offsetX: -ROTATE_OFFSET_PX,
      offsetY: -ROTATE_OFFSET_PX,
      cursor: rotateCursorCss(135),
    }),
    trRotate: createCornerRotateControl({
      x: 0.5,
      y: -0.5,
      offsetX: ROTATE_OFFSET_PX,
      offsetY: -ROTATE_OFFSET_PX,
      cursor: rotateCursorCss(225),
    }),
    brRotate: createCornerRotateControl({
      x: 0.5,
      y: 0.5,
      offsetX: ROTATE_OFFSET_PX,
      offsetY: ROTATE_OFFSET_PX,
      cursor: rotateCursorCss(315),
    }),
    blRotate: createCornerRotateControl({
      x: -0.5,
      y: 0.5,
      offsetX: -ROTATE_OFFSET_PX,
      offsetY: ROTATE_OFFSET_PX,
      cursor: rotateCursorCss(45),
    }),
  }
}

export const FABRIC_EDITOR_TRANSFORM_CONTROLS_VISIBILITY = {
  tl: true,
  tr: true,
  bl: true,
  br: true,
  mt: true,
  mb: true,
  ml: true,
  mr: true,
  /** 顶中旋转杆：改用四角外侧热区，更接近 Figma */
  mtr: false,
  tlRotate: true,
  trRotate: true,
  blRotate: true,
  brRotate: true,
} as const

const ROTATE_CONTROL_KEYS = [
  'tlRotate',
  'trRotate',
  'brRotate',
  'blRotate',
] as const

/** 给对象补上角外旋转热区（可重复调用） */
export function ensureFabricEditorObjectControls(obj: TFabricObject): void {
  const extras = createFabricEditorCornerRotateControls()
  for (const key of ROTATE_CONTROL_KEYS) {
    if (!obj.controls[key]) {
      obj.controls[key] = extras[key]!
    }
  }
}
