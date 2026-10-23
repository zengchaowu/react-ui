import type { Canvas, FabricObject } from 'fabric'
import type { ReactNode } from 'react'

export type TpFabricDesignEditorShapeTool = 'rect' | 'circle' | 'triangle'

/** 底部视口导航：选择移动 / 抓手平移 */
export type TpFabricViewportTool = 'select' | 'hand'

export type TpFabricDesignEditorTool =
  | 'select'
  | 'draw'
  | 'pen'
  | 'text'
  | 'frame'
  | TpFabricDesignEditorShapeTool

export const TP_FABRIC_SHAPE_TOOLS: readonly TpFabricDesignEditorShapeTool[] = [
  'rect',
  'circle',
  'triangle',
]

export function isTpFabricShapeTool(
  tool: string,
): tool is TpFabricDesignEditorShapeTool {
  return (TP_FABRIC_SHAPE_TOOLS as readonly string[]).includes(tool)
}

/** `TpFabricDesignEditor` 通过 `defineExpose` 暴露的方法（用于父组件 `ref` 类型） */
export type TpFabricDesignEditorExpose = {
  getCanvas: () => Canvas | undefined
  getSvgString: () => string
  getSelectionSvgString: () => string
  loadSvgString: (
    raw: string,
    options?: {
      replace?: boolean
      sourceFileName?: string
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
  /** 导入 PNG/JPG 等为图片图层 */
  loadImageFile: (
    file: File,
    options?: {
      replace?: boolean
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
  clearCanvas: () => void
  openImportPicker: (mode: TpFabricDesignEditorImportMode) => void
  exportSvgToFile: () => void
  exportSelectedSvgToFile: () => void
  groupSelection: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  addRectangle: () => void
  addCircle: () => void
  addTriangle: () => void
  addLine: () => void
  addFabricText: () => void
  deleteSelection: () => void
  setTool: (tool: TpFabricDesignEditorTool) => void
}

export type TpFabricDesignEditorImportMode = 'replace' | 'append'

/** 父应用提供的 SSE 流式调用（如 `streamDesignDocumentAiChat`） */
export type TpFabricDesignEditorAiStreamPhase = 'plan' | 'execute' | 'oneshot'

export type TpFabricDesignEditorAiStreamParams = {
  prompt: string
  /**
   * 选中图层的结构化上下文 JSON（图层名/类型/尺寸提示）；空字符串表示整稿生成。
   * oneshot/execute 期望 Design Document；plan 期望 DesignPlan。
   */
  selectionContext: string
  /** create = 无选区整稿；edit = 改选区（仍输出 Design Document） */
  mode?: 'create' | 'edit'
  /** plan | execute | oneshot；缺省 oneshot */
  phase?: TpFabricDesignEditorAiStreamPhase
  onDelta: (text: string) => void
  signal?: AbortSignal
}

export type TpFabricDesignEditorAiStreamResult =
  | { ok: true }
  | { ok: false; error: string }

export interface TpFabricDesignEditorAiOptions {
  enabled: boolean
  /** 菜单与弹层标题展示 */
  agentDisplayName?: string
  stream: (
    params: TpFabricDesignEditorAiStreamParams,
  ) => Promise<TpFabricDesignEditorAiStreamResult>
}

export interface TpFabricDesignEditorProps {
  /**
   * 画布逻辑像素宽度的回退值：实际渲染尺寸以画布容器 `clientWidth`/`clientHeight` 为准（随 flex 布局变化），
   * 仅在容器尚未铺开（如隐藏标签页宽高为 0）时使用本值，避免命中检测与显示错位。
   */
  width?: number
  /**
   * 画布逻辑像素高度的回退值，规则同 `width`。
   */
  height?: number
  /**
   * 导出时使用的逻辑画板尺寸（如 1024）；编辑态画布铺满容器，不裁剪、不插入引导层。
   */
  fixedCanvasSize?: number | { width: number; height: number }
  backgroundColor?: string
  /** 画布初始化完成后自动加载（可在其后通过 `loadSvgString` 更新） */
  initialSvg?: string
  showToolbar?: boolean
  /** 右侧图层树（CwTree），顺序与 PS 类似：列表顶部对应最上层对象 */
  showLayersPanel?: boolean
  /** 仅预览：禁用指针交互 */
  readonly?: boolean
  enableZoom?: boolean
  minZoom?: number
  maxZoom?: number
  /**
   * 工具栏「追加导入 / 替换画布」打开文件框时的默认模式（也可用两个按钮分别指定）。
   * `append`：叠到当前画布上，可多次导入或多选文件组合多个 SVG。
   */
  svgImportMode?: TpFabricDesignEditorImportMode
  /**
   * 为 `false` 时导入 SVG 不合并为单个编组，各路径/子树独立成层（适合 iconfont 多色图标）。
   * 默认 `true` 保持整份 SVG 合并为一个编组的历史行为。
   */
  svgImportGroupElements?: boolean
  /**
   * 设计 AI 助手：浮动图标打开右侧侧栏；由父组件注入 `stream`（HTTP SSE）。
   * 不传或未 enabled 则不显示入口。
   */
  designAi?: TpFabricDesignEditorAiOptions | null
  /** 画笔工具默认颜色；不传时使用编辑器内置灰色 */
  drawBrushColor?: string
  /** 工具条位置：top 顶栏横条；side 左侧竖条 */
  toolRailPlacement?: 'side' | 'top'
  /** 从工具条隐藏的工具 key（如将导入/导出挪到外部菜单） */
  toolRailHiddenKeys?: readonly string[]
}

export interface TpFabricDesignEditorEmits {
  ready: [canvas: Canvas]
  error: [error: Error]
  /** 设计 AI 已成功将 Design Document 落到画布 */
  'design-ai-applied': []
  'export-svg': [svg: string]
  /** 仅导出当前选中（单个图形或已编组对象） */
  'export-svg-selection': [svg: string]
  'object-added': [object: FabricObject]
  'object-removed': [object: FabricObject]
  'object-modified': [object: FabricObject]
}

export type FabricDesignEditorEmitFn = <K extends keyof TpFabricDesignEditorEmits & string>(
  event: K,
  ...args: TpFabricDesignEditorEmits[K]
) => void

/**
 * React 版组件 Props：Vue `defineEmits` → `onXxx` 回调；具名插槽 → `xxxSlot`。
 */
export interface TpFabricDesignEditorComponentProps
  extends TpFabricDesignEditorProps {
  /** 等价 Vue 具名插槽 `shell-header` */
  shellHeaderSlot?: ReactNode
  /** 等价 Vue 具名插槽 `tool-rail-leading` */
  toolRailLeadingSlot?: ReactNode
  /** 等价 Vue 具名插槽 `inspector-icon-meta` */
  inspectorIconMetaSlot?: ReactNode
  /** 等价 Vue `ready` */
  onReady?: (canvas: Canvas) => void
  /** 等价 Vue `error` */
  onError?: (error: Error) => void
  /** 等价 Vue `design-ai-applied` */
  onDesignAiApplied?: () => void
  /** 等价 Vue `export-svg` */
  onExportSvg?: (svg: string) => void
  /** 等价 Vue `export-svg-selection` */
  onExportSvgSelection?: (svg: string) => void
  /** 等价 Vue `object-added` */
  onObjectAdded?: (object: FabricObject) => void
  /** 等价 Vue `object-removed` */
  onObjectRemoved?: (object: FabricObject) => void
  /** 等价 Vue `object-modified` */
  onObjectModified?: (object: FabricObject) => void
}
