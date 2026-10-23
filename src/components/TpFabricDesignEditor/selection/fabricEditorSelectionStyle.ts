import {
  Control,
  FabricObject,
  type Canvas,
  type FabricObject as TFabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import {
  FABRIC_EDITOR_TRANSFORM_CONTROLS_VISIBILITY,
  createFabricEditorCornerRotateControls,
  ensureFabricEditorObjectControls,
} from './fabricEditorObjectControls.pure'

const BRAND = tokenSolidColors.brandColor6

/** 对象变换手柄（Figma 风格：小实心角点 + 高对比边框） */
export const FABRIC_EDITOR_OBJECT_CONTROL_STYLE = {
  cornerSize: 8,
  touchCornerSize: 14,
  transparentCorners: false,
  cornerColor: BRAND,
  cornerStrokeColor: tokenSolidColors.white,
  borderColor: BRAND,
  borderScaleFactor: 1,
  cornerStyle: 'rect' as const,
  padding: 0,
  borderOpacityWhenMoving: 1,
  centeredScaling: false,
  /** 选中后不切到 move 光标，保持箭头 */
  hoverCursor: 'default' as const,
  moveCursor: 'default' as const,
}

/** 框选矩形样式 */
export const FABRIC_EDITOR_CANVAS_SELECTION_STYLE = {
  selectionColor: tokenSolidColors.brandColor6SelectionFill,
  selectionBorderColor: BRAND,
  selectionLineWidth: 1.5,
}

let savedInteractiveDefaults: Record<string, unknown> | null = null
let savedCreateControls:
  | (() => { controls: Record<string, Control> })
  | null = null
let installCount = 0

type FabricWithOwnDefaults = typeof FabricObject & {
  ownDefaults: Record<string, unknown>
  createControls: () => { controls: Record<string, Control> }
}

export function installFabricEditorSelectionStyle(): () => void {
  installCount += 1
  if (installCount === 1) {
    const ctor = FabricObject as FabricWithOwnDefaults
    savedInteractiveDefaults = { ...ctor.ownDefaults }
    Object.assign(ctor.ownDefaults, FABRIC_EDITOR_OBJECT_CONTROL_STYLE)

    savedCreateControls = ctor.createControls.bind(ctor)
    ctor.createControls = () => {
      const base = savedCreateControls!()
      // 压低默认顶中旋转杆优先级；四角外侧旋转热区由 ensure / create 注入
      const mtr = base.controls.mtr
      if (mtr) {
        mtr.visible = false
      }
      return {
        controls: {
          ...base.controls,
          ...createFabricEditorCornerRotateControls(),
        },
      }
    }
  }
  return () => {
    installCount -= 1
    if (installCount === 0) {
      const ctor = FabricObject as FabricWithOwnDefaults
      if (savedInteractiveDefaults) {
        Object.assign(ctor.ownDefaults, savedInteractiveDefaults)
        savedInteractiveDefaults = null
      }
      if (savedCreateControls) {
        ctor.createControls = savedCreateControls
        savedCreateControls = null
      }
    }
  }
}

export function applyFabricEditorCanvasSelectionStyle(canvas: Canvas): void {
  canvas.set(FABRIC_EDITOR_CANVAS_SELECTION_STYLE)
}

export function applyFabricEditorObjectControlStyle(obj: TFabricObject): void {
  obj.set({
    ...FABRIC_EDITOR_OBJECT_CONTROL_STYLE,
    hasBorders: true,
    hasControls: true,
  })
  ensureFabricEditorObjectControls(obj)
  // 隐藏顶中 mtr，保留边中点 + 四角缩放 + 角外旋转
  if (obj.controls.mtr) {
    obj.controls.mtr.visible = false
  }
  obj.setControlsVisibility({ ...FABRIC_EDITOR_TRANSFORM_CONTROLS_VISIBILITY })
}
