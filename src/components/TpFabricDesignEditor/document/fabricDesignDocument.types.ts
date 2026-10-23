import type { FabricContainerLayout } from '../tools/fabricContainerTool.pure'

/**
 * 设计编辑器 AI / 导入用结构化文档（v1）。
 * 根只能是容器（页面/画板）；图层（叶子图元）只能出现在某 container 的 children 中。
 * 格式真相源（JSON Schema / Format Guide）：`@zengchaowu/shared/design-document/formatGuide`
 */
export type FabricDesignDocumentV1 = {
  version: 1
  /** 页面/画板：只能是容器 */
  roots: FabricDesignContainerNode[]
}

/** 树节点 = 容器 | 图层（叶子图元） */
export type FabricDesignNode = FabricDesignContainerNode | FabricDesignLayerNode

/** 图层：无 children，只能挂在 container 下 */
export type FabricDesignLayerNode =
  | FabricDesignRectNode
  | FabricDesignCircleNode
  | FabricDesignTextNode

export type FabricDesignLayoutSpec = Pick<
  FabricContainerLayout,
  'mode' | 'direction' | 'gap' | 'padding' | 'align' | 'justify' | 'columns'
>

export type FabricDesignContainerNode = {
  type: 'container'
  name?: string
  /** 命中预设则用预设宽高；否则用 width/height */
  presetId?: string
  width?: number
  height?: number
  layout?: FabricDesignLayoutSpec
  /** 超出画板裁剪内容 */
  clipContent?: boolean
  /** 画板圆角半径 */
  cornerRadius?: number
  /** 画板填充色（Button/Card 等外壳） */
  fill?: string
  stroke?: string
  strokeWidth?: number
  /** 嵌套容器或图层 */
  children?: FabricDesignNode[]
  /** 仅当父级为 free 布局时生效（相对父内容区左上） */
  left?: number
  top?: number
}

export type FabricDesignRectNode = {
  type: 'rect'
  name?: string
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rx?: number
  left?: number
  top?: number
}

export type FabricDesignCircleNode = {
  type: 'circle'
  name?: string
  /** 直径；缺省时用 width/height 较小边 */
  diameter?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  left?: number
  top?: number
}

export type FabricDesignTextNode = {
  type: 'text'
  name?: string
  text?: string
  fontSize?: number
  fill?: string
  fontFamily?: string
  left?: number
  top?: number
}
